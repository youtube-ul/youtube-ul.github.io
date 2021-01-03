function authorize() {
    if (url_box.reportValidity() && apikey_box.reportValidity()) {
        let oauth_link = "https://accounts.google.com/o/oauth2/v2/auth?"
            + "scope=https%3A//www.googleapis.com/auth/youtube.upload&"
            + "access_type=offline&response_type=code&"
            + "redirect_uri=https%3A//youtube-ul.github.io&"
            + "client_id=76965847389-mgs6vafr6nf4agshmju10l4klv2echqg.apps.googleusercontent.com&"
            + `state=${Base64.encode(JSON.stringify({ api_key: apikey_box.value, direct_link: url_box.value }), true)}`;
        window.location.href = oauth_link;
    }
}
function captcha(response) {
    captcha_response = response;
}
function init() {
    if (api_key != null) {
        apikey_box.value = api_key;
    }
    let auth_code = url_params.get("code");
    let state;
    try {
        state = JSON.parse(Base64.decode(url_params.get("state")));
    }
    catch (e) {
        console.error(e);
        return;
    }
    if (state.api_key != null && state.direct_link != null) {
        let upload_box = document.getElementsByClassName("upload")[0];
        if (auth_code == null) {
            if (!upload_box.children[0].classList.contains("disabled")) {
                upload_box.children[0].classList.add("disabled");
            }
            upload_box.children[1].classList.remove("disabled");
        }
        else {
            if (!upload_box.children[0].classList.contains("disabled")) {
                upload_box.children[0].classList.add("disabled");
            }
            upload_box.children[2].classList.remove("disabled");
            hcaptcha.render("captcha", {
                theme: "dark",
                sitekey: "91aa40ff-9f5b-46a3-a4d5-1ca20fd9448b",
                callback: captcha,
            });
        }
    }
    else {
        console.error("Direct link not specified in state parameter");
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
const WEBSOCKET_URI = "";
let api_key = localStorage.getItem("api_key");
let captcha_response = null;
let url_params = new URLSearchParams(window.location.search);
let websocket;
let apikey_box = document.getElementById("api_key");
let authorize_button = document.getElementById("authorize_button");
let live_count = document.getElementById("live_count");
let server_status = document.getElementById("server_status");
let url_box = document.getElementById("url");
function connect() {
    websocket = new WebSocket(WEBSOCKET_URI);
    websocket.onopen = () => {
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
    websocket.onclose = () => {
        server_status.classList.add("bad");
        server_status.classList.remove("good");
        server_status.innerText = "RECONNECTING";
        document.getElementById("live_count").innerText = "0";
        connect();
    };
    websocket.onerror = () => {
        server_status.classList.add("bad");
        server_status.classList.remove("good");
        server_status.innerText = "RECONNECTING";
        document.getElementById("live_count").innerText = "0";
        connect();
    };
}
function process_message(message) {
    switch (message.type) {
        case "DlStatus":
            {
                break;
            }
        case "Downloading":
            {
                break;
            }
        case "Error":
            {
                break;
            }
        case "Finished":
            {
                break;
            }
        case "InQueue":
            {
                break;
            }
        case "LiveCount":
            {
                live_count.innerText = message.count.toString();
                break;
            }
        case "UpdateQueue":
            {
                break;
            }
    }
}
