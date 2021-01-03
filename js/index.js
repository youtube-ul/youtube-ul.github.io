let websocket = null;
let captcha_response = null;
let urlParams = new URLSearchParams(window.location.search);
let api_key = localStorage.getItem("api_key");
let queue_x;

let oauth_link = "https://accounts.google.com/o/oauth2/v2/auth?"
    + "scope=https%3A//www.googleapis.com/auth/youtube.upload&"
    + "access_type=offline&response_type=code&"
    + "redirect_uri=https%3A//youtube-ul.github.io&"
    + "client_id=76965847389-mgs6vafr6nf4agshmju10l4klv2echqg.apps.googleusercontent.com&"
    + "state=";

init();

function upload() {
    let url = document.getElementById("url");
    let api_key = document.getElementById("api_key");

    if (url.reportValidity() && api_key.reportValidity()) {
        document.getElementById("upload_button").setAttribute("disabled", "disabled");
        url.setAttribute("disabled", "disabled");
        api_key.setAttribute("disabled", "disabled");

        document.getElementsByClassName("first")[0].classList.add("disabled");
        document.getElementsByClassName("second")[0].classList.remove("disabled");

        websocket.onmessage = (message) => {
            if (message.data == "ping") {
                websocket.send("pong");
            } else {
                let message = JSON.parse(message.data);
                let status = document.getElementById("upload_status");
                let progress = document.getElementById("progress");

                /*
                1. Get initial queue position
                2. Name that X and set progress to 0
                3. Every time you get UpdateQueue, add (1 / X * 100) to progress
                4. Once you get Downloading packet, queue is finished
                */

                switch (message.type) {
                    case "Downloading":
                        status.innerText = "Downloading (0 B transferred)";
                        break;
                    case "InQueue":
                        progress.max = message.position;
                        progress.value = 0;
                        break;
                    case "DlStatus":
                        if (message.dltotal == 0) {
                            status.innerText = `Downloading (${prettyBytes(message.dlnow, { binary: true })} transferred)`;
                        } else {
                            progress.max = message.dltotal;
                            progress.value = message.dlnow;
                        }

                        break;
                    case "UpdateQueue":
                        progress.value += 1;
                        break;
                    case "UploadingVideo":
                        status.innerText = "Uploading video to YouTube";
                        progress.max = undefined;
                        progress.value = undefined;
                        break;
                    case "Finished":
                        status.innerText = "Finished uploading!";
                        progress.max = 100;
                        progress.value = 100;

                        let video_link = document.getElementById("video_link");
                        video_link.classList.remove("disabled");
                        video_link.children[0].href = `https://youtu.be/${message.video_id}`;
                        video_link.children[0].innerText = `https://youtu.be/${message.video_id}`;

                        break;
                    case "Error":
                        websocket.close();
                        status.classList.add("error");
                        status.innerText = message.description;

                        progress.max = 100;
                        progress.value = 0;
                        break;
                }
            }
        };
    }
}

function init() {
    let auth_code = urlParams.get("code");
    let direct_link = urlParams.get("state");

    if (direct_link != null) {
        document.getElementById("url").value = direct_link;
    }

    websocket = new WebSocket("ws://localhost:8080/ws");

    websocket.onopen = () => {
        let status = document.getElementById("server_status");
        status.classList.remove("bad");
        status.classList.add("good");
        status.innerText = "ONLINE";

        captcha(null);
    };

    websocket.onmessage = (message) => {
        if (message.data == "ping") {
            websocket.send("pong");
        }
    };

    websocket.onclose = () => {
        let status = document.getElementById("server_status");
        status.classList.add("bad");
        status.classList.remove("good");
        status.innerText = "RECONNECTING";

        document.getElementById("live_count").innerText = "0";

        recaptcha();
        connect();
    }

    websocket.onerror = (error) => {
        let status = document.getElementById("server_status");
        status.classList.add("bad");
        status.classList.remove("good");
        status.innerText = "CONNECTING";

        document.getElementById("live_count").innerText = "0";

        recaptcha();
        connect();
    }
}

function captcha(response) {
    document.getElementById("upload_button").removeAttribute("disabled");
    captcha_response = response;
}

function recaptcha() {
    document.getElementById("upload_button").setAttribute("disabled", "disabled");
    captcha_response = null;
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
    } else if (locale === true) {
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