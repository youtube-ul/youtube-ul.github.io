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
        document.getElementById("live_count").innerText = "0";

        if (reconnect) {
            server_status.classList.add("bad");
            server_status.classList.remove("good");
            server_status.innerText = "RECONNECTING";

            connect();
        } else {
            server_status.classList.add("bad");
            server_status.classList.remove("good");
            server_status.innerText = "DISCONNECTED";
        }
    }

    websocket.onerror = () => {
        document.getElementById("live_count").innerText = "0";

        if (reconnect) {
            server_status.classList.add("bad");
            server_status.classList.remove("good");
            server_status.innerText = "RECONNECTING";

            connect();
        } else {
            server_status.classList.add("bad");
            server_status.classList.remove("good");
            server_status.innerText = "DISCONNECTED";
        }
    }
}

function process_message(message: ServerMessage) {
    switch (message.type) {
        case "Current":
            {
                let current = message as Current;
                transferred += current.transferred;

                upload_status.innerText = `Uploading (${prettyBytes(transferred, { binary: true })} transferred)`;

                progress.value = transferred;

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
                video_link_a.href = finished.url;
                video_link_a.innerText = `${finished.url} (adlink)`;

                break;
            }
        case "InQueue":
            {
                let in_queue = message as InQueue;
                queue = in_queue.position;
                upload_status.innerText = `In queue (position ${queue})`;
                progress.max = in_queue.position;
                progress.value = 0;
                break;
            }
        case "LiveCount":
            {
                live_count.innerText = (message as LiveCount).count.toString();
                break;
            }
        case "StartedTransfer":
            {
                upload_status.innerText = "Uploading (0 B transferred)";
                progress.max = (message as StartedTransfer).total;
                break;
            }
        case "UpdateQueue":
            {
                queue -= 1;
                upload_status.innerText = `In queue (position ${queue})`;
                progress.value += 1;
                break;
            }
    }
}