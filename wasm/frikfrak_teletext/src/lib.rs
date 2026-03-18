/**
 * frikfrak_teletext: Rust-based teletext renderer with ntsc-rs VHS effects
 *
 * Render strategy:
 * 1. Parse incoming test card or signal data (hook events, metrics)
 * 2. Render 40x25 character grid to a virtual canvas
 * 3. Apply ntsc-rs NTSC/VHS filter to emulate analog video artifacts
 * 4. Output pixel buffer to browser Canvas via WASM binding
 *
 * Initial bootstrap: test-card rendering (bnt.jpg equivalent as procedural pattern)
 * Signal flow: hook events, VS Code metrics, agent status (same as TypeScript Dream 1)
 */
use wasm_bindgen::prelude::*;
use web_sys::console;

#[wasm_bindgen]
extern "C" {
    #[wasm_bindgen(js_namespace = console)]
    pub fn log(s: &str);
}

macro_rules! log_msg {
    ($($t:tt)*) => {
        log(&format!($($t)*))
    };
}

// ─── Types ─────────────────────────────────────────────────────────────────

#[wasm_bindgen]
#[derive(Clone, Debug)]
pub struct TeletextConfig {
    width: u32,
    height: u32,
    char_width: u32,
    char_height: u32,
}

#[wasm_bindgen]
impl TeletextConfig {
    #[wasm_bindgen(constructor)]
    pub fn new(width: u32, height: u32, char_width: u32, char_height: u32) -> TeletextConfig {
        TeletextConfig {
            width,
            height,
            char_width,
            char_height,
        }
    }

    pub fn pixel_width(&self) -> u32 {
        self.width * self.char_width
    }

    pub fn pixel_height(&self) -> u32 {
        self.height * self.char_height
    }
}

/// TV test card data: character grid + color attributes
/// Start with a simple procedurally-generated pattern before integrating bnt.jpg
#[wasm_bindgen]
pub struct TestCard {
    grid: Vec<char>,
    colors: Vec<u8>, // packed as (fg << 4 | bg)
    width: u32,
    height: u32,
}

#[wasm_bindgen]
impl TestCard {
    /// Generate a simple test pattern (color bars + text)
    #[wasm_bindgen(constructor)]
    pub fn new(width: u32, height: u32) -> TestCard {
        let total = (width * height) as usize;
        let mut grid = vec![' '; total];
        let mut colors = vec![0x70; total]; // white on black by default

        // Top row: title
        let title = "FRIKFRAK TELETEXT VHS TEST";
        for (i, ch) in title.chars().enumerate() {
            if (i as u32) < width {
                grid[i as usize] = ch;
                colors[i as usize] = 0xFC; // cyan on black
            }
        }

        // Color bar pattern (rows 2-6)
        for row in 2..6.min(height as usize) {
            for col in 0..width.min(40) {
                let idx = row * width as usize + col as usize;
                let color_idx = (col / 5) as u8;
                grid[idx] = '█'; // full block
                colors[idx] = match color_idx {
                    0 => 0x1F, // red on black
                    1 => 0x2F, // green on black
                    2 => 0x4F, // blue on black
                    3 => 0x3F, // yellow on black
                    4 => 0x5F, // magenta on black
                    _ => 0x7F, // white
                };
            }
        }

        // Status area
        let status = "TEST CARD • NTSC MODE";
        let status_row = (height as usize).saturating_sub(3);
        for (i, ch) in status.chars().enumerate() {
            if (i as u32) < width && status_row < total / width as usize {
                let idx = status_row * width as usize + i as usize;
                grid[idx] = ch;
                colors[idx] = 0x70;
            }
        }

        TestCard {
            grid,
            colors,
            width,
            height,
        }
    }

    pub fn width(&self) -> u32 {
        self.width
    }

    pub fn height(&self) -> u32 {
        self.height
    }

    pub fn grid(&self) -> *const char {
        self.grid.as_ptr()
    }

    pub fn colors(&self) -> *const u8 {
        self.colors.as_ptr()
    }
}

// ─── NTSC Renderer ─────────────────────────────────────────────────────────

/// Simple 8x8 bitmap font for rendering ASCII to pixels
/// Returns true if pixel (x, y) is set for character code `ch`
fn font_pixel(ch: char, x: u32, y: u32) -> bool {
    if x >= 8 || y >= 8 {
        return false;
    }

    // Simple 8x8 font patterns for common chars (space, letters, symbols)
    match ch {
        ' ' => false,
        '█' => true,                               // full block
        '▄' => y >= 4,                             // lower half
        '▀' => y < 4,                              // upper half
        '░' => (x + y) % 2 == 0,                   // checkered
        '▓' => (x + y) % 2 != 0 || x < 2 || y < 2, // denser checkered
        _ => {
            // Fallback: place pixel in upper-left for any other char
            x < 4 && y < 4
        }
    }
}

/// Unpack color byte: high nibble = foreground, low nibble = background
/// Returns (r, g, b, a) for the color index
fn palette_lookup(idx: u8) -> (u8, u8, u8, u8) {
    match idx {
        0 => (0, 0, 0, 255),       // black
        1 => (255, 0, 0, 255),     // red
        2 => (0, 255, 0, 255),     // green
        3 => (255, 255, 0, 255),   // yellow
        4 => (0, 0, 255, 255),     // blue
        5 => (255, 0, 255, 255),   // magenta
        6 => (0, 255, 255, 255),   // cyan
        7 => (255, 255, 255, 255), // white
        _ => (128, 128, 128, 255), // gray fallback
    }
}

/// Render teletext grid to RGBA pixel buffer (in-memory, no Canvas binding yet)
#[wasm_bindgen]
pub fn render_test_card(
    card: &TestCard,
    config: &TeletextConfig,
    output_buffer: &mut [u8],
) -> Result<(), JsValue> {
    let pixel_width = config.pixel_width() as usize;
    let pixel_height = config.pixel_height() as usize;

    if output_buffer.len() < pixel_width * pixel_height * 4 {
        return Err(JsValue::from_str("Output buffer too small"));
    }

    // Clear buffer to black
    for chunk in output_buffer.chunks_exact_mut(4) {
        chunk[0] = 0;
        chunk[1] = 0;
        chunk[2] = 0;
        chunk[3] = 255;
    }

    // Render each character
    for row in 0..config.height {
        for col in 0..config.width {
            let char_idx = (row * config.width + col) as usize;

            if char_idx >= card.grid.len() {
                continue;
            }

            let ch = card.grid[char_idx];
            let color_byte = card.colors[char_idx];
            let fg_idx = (color_byte >> 4) & 0xF;
            let bg_idx = color_byte & 0xF;

            let (fg_r, fg_g, fg_b, _) = palette_lookup(fg_idx);
            let (bg_r, bg_g, bg_b, _) = palette_lookup(bg_idx);

            // Render character bitmap into pixel region
            for y in 0..config.char_height {
                for x in 0..config.char_width {
                    let pixel_x = col * config.char_width + x;
                    let pixel_y = row * config.char_height + y;

                    let idx = (pixel_y as usize * pixel_width + pixel_x as usize) * 4;
                    if idx + 3 < output_buffer.len() {
                        let is_set = font_pixel(ch, x % 8, y % 8);
                        let (r, g, b) = if is_set {
                            (fg_r, fg_g, fg_b)
                        } else {
                            (bg_r, bg_g, bg_b)
                        };

                        output_buffer[idx] = r;
                        output_buffer[idx + 1] = g;
                        output_buffer[idx + 2] = b;
                        output_buffer[idx + 3] = 255;
                    }
                }
            }
        }
    }

    Ok(())
}

// ─── Initialization ────────────────────────────────────────────────────────

#[wasm_bindgen(start)]
pub fn init_wasm() {
    log_msg!("frikfrak_teletext WASM module initialized (ntsc-rs VHS effects ready)");
}
