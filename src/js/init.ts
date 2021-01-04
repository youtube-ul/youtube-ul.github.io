interface State {
    api_key: string;
    direct_link: string;
    title: string;
}

function init() {
    if (localStorage.getItem("api_key") != null) {
        apikey_box.value = localStorage.getItem("api_key");
    }

    if (localStorage.getItem("client_id") != null) {
        client_id.value = localStorage.getItem("client_id");
    }

    if (localStorage.getItem("client_secret") != null) {
        client_secret.value = localStorage.getItem("client_secret");
    }

    let temp_state = url_params.get("state");
    auth_code = url_params.get("code");

    if (temp_state != null && auth_code != null) {
        try {
            state = JSON.parse(Base64.decode(temp_state));
        } catch (e) {
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
                        sitekey: "91aa40ff-9f5b-46a3-a4d5-1ca20fd9448b",
                        callback: captcha,
                    });
                }
            }, 250);

        } else {
            console.error("Direct link not specified in state parameter");
        }
    } else {
        if (!ub_loading.classList.contains("disabled")) {
            ub_loading.classList.add("disabled");
        }

        ub_first.classList.remove("disabled");
    }
}