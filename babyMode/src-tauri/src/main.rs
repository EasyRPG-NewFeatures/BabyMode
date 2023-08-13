#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

use std::sync::Mutex;

use tauri::State;
use tauri::api::dialog::*;
use tauri::Manager;

// Define a structure for a Mutex<i32> counter
struct Counter(Mutex<i32>);

// Increase or decrease the counter value and return the new value
#[tauri::command]
fn counter(count_val: i32, counter: State<Counter>) -> i32 {
    let mut ct = counter.0.lock().unwrap();
    *ct += count_val;
    *ct
}

// Display the received value in a message box
use std::fs::File;
use std::io::Write;
use std::process::Command;

#[tauri::command]
fn call_rust(js_msg: String, env: String, window: tauri::Window) -> String {
   // println!("Message from JS: {}", js_msg);

    // Create a new .bat file
    let file_path = "installScript.bat";
    let mut file = File::create(file_path)
        .expect("Unable to create file");

    // Write the js_msg content to the file
    file.write_all(js_msg.as_bytes())
        .expect("Unable to write data to file");

    // Explicitly close the file
    drop(file);

    // Create a new .bat file
    let file_path = "updateEnvVariables.bat";
    let mut file = File::create(file_path)
        .expect("Unable to create file");

    // Write the env content to the file
    file.write_all(env.as_bytes())
        .expect("Unable to write data to file");

    // Explicitly close the file
    drop(file);

    // Run the created .bat file with admin privileges
    let _ = Command::new("cmd")
        .args(&["/C", "start", "installScript.bat"])
        .spawn();

    let label = window.label();
    let parent_window = window.get_window(label).unwrap();
    tauri::async_runtime::spawn(async move {
        message(Some(&parent_window), "Title", "launching Installer")//&js_msg);
    });

    "Message saved to installScript.bat".into()
}


fn main() {
    tauri::Builder::default()
        .manage(Counter(Default::default()))
        .invoke_handler(tauri::generate_handler![
            call_rust,
            counter,
        ])
        .run(tauri::generate_context!())
        .expect("Error while running tauri application");
}
