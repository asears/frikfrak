static mut FRAME_COUNT: u32 = 0;
static mut PROBLEM_COUNT: u32 = 0;

#[no_mangle]
pub extern "C" fn tick() {
	unsafe {
		FRAME_COUNT = FRAME_COUNT.wrapping_add(1);
	}
}

#[no_mangle]
pub extern "C" fn frame_count() -> u32 {
	unsafe { FRAME_COUNT }
}

#[no_mangle]
pub extern "C" fn problem_count() -> u32 {
	unsafe { PROBLEM_COUNT }
}

#[no_mangle]
pub extern "C" fn set_problem_count(value: u32) {
	unsafe {
		PROBLEM_COUNT = value;
	}
}
