function authorize() {
    if (url_box.reportValidity() && apikey_box.reportValidity()) {
        let oauth_link = "https://accounts.google.com/o/oauth2/v2/auth?"
            + "scope=https%3A//www.googleapis.com/auth/youtube.upload&"
            + "access_type=offline&response_type=code&"
            + "redirect_uri=https%3A//youtube-ul.github.io&"
            + "client_id=76965847389-mgs6vafr6nf4agshmju10l4klv2echqg.apps.googleusercontent.com&"
            + `state=${Base64.encode(JSON.stringify({ api_key: apikey_box.value, direct_link: url_box.value } as State), true)}`;

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
        url: state.direct_link,
    } as Upload));
}