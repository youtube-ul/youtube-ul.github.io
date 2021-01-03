function authorize() {
    if (url_box.reportValidity() && apikey_box.reportValidity() && title_box.reportValidity()) {
        let oauth_link = "https://accounts.google.com/o/oauth2/v2/auth?"
            + "scope=https%3A//www.googleapis.com/auth/youtube.upload&"
            + "access_type=offline&response_type=code&"
            + "redirect_uri=https%3A//youtube-ul.com&"
            + "client_id=76965847389-mgs6vafr6nf4agshmju10l4klv2echqg.apps.googleusercontent.com&"
            + `state=${Base64.encode(JSON.stringify({ api_key: apikey_box.value, direct_link: url_box.value, title: title_box.value }), true)}`;
        localStorage.setItem("api_key", apikey_box.value);
        window.location.href = oauth_link;
    }
}
function captcha(response) {
    ub_second.classList.add("disabled");
    ub_third.classList.remove("disabled");
    websocket.send(JSON.stringify({
        type: "Upload",
        api_key: state.api_key,
        authorization_code: auth_code,
        captcha: response,
        title: state.title,
        url: state.direct_link,
    }));
}
function init() {
    if (api_key != null) {
        apikey_box.value = api_key;
    }
    let temp_state = url_params.get("state");
    auth_code = url_params.get("code");
    if (temp_state != null && auth_code != null) {
        try {
            state = JSON.parse(Base64.decode(temp_state));
        }
        catch (e) {
            console.error(e);
            return;
        }
        if (state.api_key != null && state.direct_link != null && state.title != null) {
            if (!ub_loading.classList.contains("disabled")) {
                ub_loading.classList.add("disabled");
            }
            ub_second.classList.remove("disabled");
            let interval = setInterval(() => {
                if (hcaptcha_loaded) {
                    clearInterval(interval);
                    hcaptcha.render("captcha", {
                        theme: "dark",
                        sitekey: "10000000-ffff-ffff-ffff-000000000001",
                        //sitekey: "91aa40ff-9f5b-46a3-a4d5-1ca20fd9448b",
                        callback: captcha,
                    });
                }
            }, 250);
        }
        else {
            console.error("Direct link not specified in state parameter");
        }
    }
    else {
        if (!ub_loading.classList.contains("disabled")) {
            ub_loading.classList.add("disabled");
        }
        ub_first.classList.remove("disabled");
    }
}
const BYTE_UNITS = [
    'B',
    'kB',
    'MB',
    'GB',
    'TB',
    'PB',
    'EB',
    'ZB',
    'YB'
];
const BIBYTE_UNITS = [
    'B',
    'kiB',
    'MiB',
    'GiB',
    'TiB',
    'PiB',
    'EiB',
    'ZiB',
    'YiB'
];
const BIT_UNITS = [
    'b',
    'kbit',
    'Mbit',
    'Gbit',
    'Tbit',
    'Pbit',
    'Ebit',
    'Zbit',
    'Ybit'
];
const BIBIT_UNITS = [
    'b',
    'kibit',
    'Mibit',
    'Gibit',
    'Tibit',
    'Pibit',
    'Eibit',
    'Zibit',
    'Yibit'
];
/*
Formats the given number using `Number#toLocaleString`.
- If locale is a string, the value is expected to be a locale-key (for example: `de`).
- If locale is true, the system default locale is used for translation.
- If no value for locale is specified, the number is returned unmodified.
*/
const toLocaleString = (number, locale) => {
    let result = number;
    if (typeof locale === 'string' || Array.isArray(locale)) {
        result = number.toLocaleString(locale);
    }
    else if (locale === true) {
        result = number.toLocaleString();
    }
    return result;
};
function prettyBytes(number, options) {
    if (!Number.isFinite(number)) {
        throw new TypeError(`Expected a finite number, got ${typeof number}: ${number}`);
    }
    options = Object.assign({ bits: false, binary: false }, options);
    const UNITS = options.bits ?
        (options.binary ? BIBIT_UNITS : BIT_UNITS) :
        (options.binary ? BIBYTE_UNITS : BYTE_UNITS);
    if (options.signed && number === 0) {
        return ` 0 ${UNITS[0]}`;
    }
    const isNegative = number < 0;
    const prefix = isNegative ? '-' : (options.signed ? '+' : '');
    if (isNegative) {
        number = -number;
    }
    if (number < 1) {
        const numberString = toLocaleString(number, options.locale);
        return prefix + numberString + ' ' + UNITS[0];
    }
    const exponent = Math.min(Math.floor(options.binary ? Math.log(number) / Math.log(1024) : Math.log10(number) / 3), UNITS.length - 1);
    // eslint-disable-next-line unicorn/prefer-exponentiation-operator
    number = Number((number / Math.pow(options.binary ? 1024 : 1000, exponent)).toPrecision(3));
    const numberString = toLocaleString(number, options.locale);
    const unit = UNITS[exponent];
    return prefix + numberString + ' ' + unit;
}
const WEBSOCKET_URI = "ws://localhost:8080/ws";
let api_key = localStorage.getItem("api_key");
let auth_code;
let captcha_response = null;
let reconnect = true;
let state;
let url_params = new URLSearchParams(window.location.search);
let websocket;
let upload_box = document.getElementsByClassName("upload")[0];
let ub_loading = upload_box.children[0];
let ub_first = upload_box.children[1];
let ub_second = upload_box.children[2];
let ub_third = upload_box.children[3];
let apikey_box = document.getElementById("api_key");
let authorize_button = document.getElementById("authorize_button");
let live_count = document.getElementById("live_count");
let server_status = document.getElementById("server_status");
let title_box = document.getElementById("title");
let url_box = document.getElementById("url");
let upload_status = document.getElementById("upload_status");
let progress = document.getElementById("progress");
let video_link = document.getElementById("video_link");
let video_link_a = video_link.children[0];
connect();
function connect() {
    websocket = new WebSocket(WEBSOCKET_URI);
    websocket.onopen = () => {
        reconnect = false;
        server_status.classList.remove("bad");
        server_status.classList.add("good");
        server_status.innerText = "ONLINE";
        init();
    };
    websocket.onmessage = (ev) => {
        if (ev.data == "ping") {
            websocket.send("pong");
        }
        else {
            try {
                process_message(JSON.parse(ev.data));
            }
            catch (e) {
                console.error(e);
                alert(e);
            }
        }
    };
    // On error/disconnect:
    // 1. Stop any upload screen
    websocket.onclose = () => {
        server_status.classList.add("bad");
        server_status.classList.remove("good");
        server_status.innerText = "DISCONNECTED";
        document.getElementById("live_count").innerText = "0";
        if (reconnect) {
            connect();
        }
    };
    websocket.onerror = () => {
        server_status.classList.add("bad");
        server_status.classList.remove("good");
        server_status.innerText = "RECONNECTING";
        document.getElementById("live_count").innerText = "0";
        if (reconnect) {
            connect();
        }
    };
}
function process_message(message) {
    switch (message.type) {
        case "DlStatus":
            {
                let dlstatus = message;
                console.log("DlStatus");
                console.log(dlstatus);
                upload_status.innerText = `Downloading (${prettyBytes(dlstatus.dlnow, { binary: true })} transferred)`;
                if (dlstatus.dltotal != 0) {
                    progress.max = dlstatus.dltotal;
                    progress.value = dlstatus.dlnow;
                    if (dlstatus.dlnow == dlstatus.dlnow) {
                        upload_status.innerText = "Uploading";
                        progress.removeAttribute("value");
                    }
                }
                break;
            }
        case "Downloading":
            {
                upload_status.innerText = "Downloading (0 B transferred)";
                break;
            }
        case "Error":
            {
                websocket.close();
                upload_status.classList.add("error");
                upload_status.innerText = message.description;
                progress.max = 100;
                progress.value = 0;
                break;
            }
        case "Finished":
            {
                let finished = message;
                upload_status.innerText = "Finished uploading!";
                progress.max = 100;
                progress.value = 100;
                let video_link = document.getElementById("video_link");
                video_link.classList.remove("disabled");
                video_link_a.href = `https://youtu.be/${finished.video_id}`;
                video_link_a.innerText = `https://youtu.be/${finished.video_id}`;
                break;
            }
        case "InQueue":
            {
                progress.max = message.position;
                progress.value = 0;
                break;
            }
        case "LiveCount":
            {
                live_count.innerText = message.count.toString();
                break;
            }
        case "UlStatus":
            {
                let ulstatus = message;
                upload_status.innerText = `Uploading (${prettyBytes(ulstatus.ulnow, { binary: true })} transferred)`;
                console.log("Ulstatus");
                console.log(ulstatus);
                if (ulstatus.ultotal != 0) {
                    progress.max = ulstatus.ultotal;
                    progress.value = ulstatus.ulnow;
                }
                break;
            }
        case "UpdateQueue":
            {
                progress.value += 1;
                break;
            }
        case "UploadingVideo":
            {
                upload_status.innerText = "Uploading (0 B transferred)";
                break;
            }
    }
}
