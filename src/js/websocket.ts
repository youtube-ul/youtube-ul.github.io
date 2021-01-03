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

    websocket.onclose = () => {
        server_status.classList.add("bad");
        server_status.classList.remove("good");
        server_status.innerText = "RECONNECTING";

        document.getElementById("live_count").innerText = "0";

        connect();
    }

    websocket.onerror = () => {
        server_status.classList.add("bad");
        server_status.classList.remove("good");
        server_status.innerText = "RECONNECTING";

        document.getElementById("live_count").innerText = "0";

        connect();
    }
}

function process_message(message: ServerMessage) {
    switch (message.type) {
        case "DlStatus":
            {
                let dlstatus = message as DlStatus;

                if (dlstatus.dltotal == 0) {
                    upload_status.innerText = `Downloading (${prettyBytes(dlstatus.dlnow, { binary: true })} transferred)`;
                } else {
                    progress.max = dlstatus.dltotal;
                    progress.value = dlstatus.dlnow;
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
        case "UpdateQueue":
            {
                progress.value += 1;
                break;
            }
    }
}