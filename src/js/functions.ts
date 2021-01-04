function authorize() {
    if (url_box.reportValidity() && apikey_box.reportValidity() && title_box.reportValidity() && client_id.reportValidity() && client_secret.reportValidity()) {
        let oauth_link = "https://accounts.google.com/o/oauth2/v2/auth?"
            + "scope=https%3A//www.googleapis.com/auth/youtube.upload&"
            + "access_type=offline&response_type=code&"
            + "redirect_uri=https%3A//youtube-ul.github.io&"
            + `client_id=${client_id.value}&`
            + `state=${Base64.encode(JSON.stringify({ api_key: apikey_box.value, direct_link: url_box.value, title: title_box.value } as State), true)}`;

        localStorage.setItem("api_key", apikey_box.value);
        localStorage.setItem("client_id", client_id.value);
        localStorage.setItem("client_secret", client_secret.value);

        window.location.href = oauth_link;
    }
}

function captcha(response: string) {
    ub_second.classList.add("disabled");
    ub_third.classList.remove("disabled");

    websocket.send(JSON.stringify({
        type: "Upload",
        api_key: state.api_key,
        authorization_code: auth_code,
        captcha: response,
        client_id: client_id.value,
        client_secret: client_secret.value,
        title: state.title,
        url: state.direct_link,
    } as Upload));
}