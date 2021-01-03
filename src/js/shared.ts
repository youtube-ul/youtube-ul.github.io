const WEBSOCKET_URI = "ws://localhost:8080/ws";

let api_key = localStorage.getItem("api_key");
let auth_code: string;
let captcha_response: String = null;
let state: State;
let url_params = new URLSearchParams(window.location.search);
let websocket: WebSocket;

let upload_box = document.getElementsByClassName("upload")[0];
let ub_loading = upload_box.children[0];
let ub_first = upload_box.children[1];
let ub_second = upload_box.children[2];
let ub_third = upload_box.children[3];

let apikey_box = document.getElementById("api_key") as HTMLInputElement;
let authorize_button = document.getElementById("authorize_button");
let live_count = document.getElementById("live_count");
let server_status = document.getElementById("server_status");
let url_box = document.getElementById("url") as HTMLInputElement;

let upload_status = document.getElementById("upload_status");
let progress = document.getElementById("progress") as HTMLProgressElement;
let video_link = document.getElementById("video_link");
let video_link_a = video_link.children[0] as HTMLAnchorElement;