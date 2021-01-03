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
        } else {
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
    }

    websocket.onerror = () => {
        server_status.classList.add("bad");
        server_status.classList.remove("good");
        server_status.innerText = "RECONNECTING";

        document.getElementById("live_count").innerText = "0";

        if (reconnect) {
            connect();
        }
    }
}

function process_message(message: ServerMessage) {
    switch (message.type) {
        case "DlStatus":
            {
                let dlstatus = message as DlStatus;
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
                upload_status.innerText = (message as Error).description;

                progress.max = 100;
                progress.value = 0;

                break;
            }
        case "Finished":
            {
                let finished = message as Finished;

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
                progress.max = (message as InQueue).position;
                progress.value = 0;
                break;
            }
        case "LiveCount":
            {
                live_count.innerText = (message as LiveCount).count.toString();
                break;
            }
        case "UlStatus":
            {
                let ulstatus = message as UlStatus;
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