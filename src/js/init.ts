interface State {
    api_key: string;
    direct_link: string;
}

function init() {
    if (api_key != null) {
        apikey_box.value = api_key;
    }

    auth_code = url_params.get("code");

    try {
        state = JSON.parse(Base64.decode(url_params.get("state")));
    } catch (e) {
        console.error(e);
        return;
    }

    if (state.api_key != null && state.direct_link != null) {
        if (auth_code == null) {
            if (!ub_loading.classList.contains("disabled")) {
                ub_loading.classList.add("disabled");
            }

            ub_first.classList.remove("disabled");
        } else {
            if (!ub_loading.classList.contains("disabled")) {
                ub_loading.classList.add("disabled");
            }

            ub_second.classList.remove("disabled");

            hcaptcha.render("captcha", {
                theme: "dark",
                sitekey: "91aa40ff-9f5b-46a3-a4d5-1ca20fd9448b",
                callback: captcha,
            });
        }
    } else {
        console.error("Direct link not specified in state parameter");
    }
}