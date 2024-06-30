<script lang="ts">
	import { onMount } from "svelte";
    import {PUBLIC_CLIENT_ID,PUBLIC_CLIENT_SECRET} from '$env/static/public';
    const clientId = PUBLIC_CLIENT_ID;
    const clientSecret = PUBLIC_CLIENT_SECRET;

    let currentStreamUrl = '';
    let pastStreamUrls = [];

    let domain = 'localhost';

    async function getToken() {
        const headers = new Headers({
            'Content-Type': 'application/x-www-form-urlencoded'
        });

        // URL-encode the data
        const details = {
            'client_id': clientId,
            'client_secret': clientSecret,
            'grant_type': 'client_credentials'
        };

        // Convert the details object into a URL-encoded string
        let formBody = [];
        for (let property in details) {
            let encodedKey = encodeURIComponent(property);
            let encodedValue = encodeURIComponent(details[property]);
            formBody.push(encodedKey + "=" + encodedValue);
        }
        formBody = formBody.join("&");

        const req = await fetch('https://id.twitch.tv/oauth2/token', {
            method: 'POST',
            headers,
            body: formBody
        });
        const data = await req.json();
        console.log(data);
        return data.access_token;
    }



    async function fetchRandomStream(token: string) {
        const headers = new Headers({
            'Client-ID': clientId,
            'Authorization': 'Bearer ' + token,
        });

        // fetch a random french stream on twitch
        const req = await fetch('https://api.twitch.tv/helix/streams?language=fr', {
            headers
        });
        const data = await req.json();
        console.log(data);

        // Assuming data contains an array of streams under `data.data`
        if (data.data.length > 0) {
            const randomStream = data.data[Math.floor(Math.random() * data.data.length)];
            const embedUrl = getEmbedUrl(randomStream.user_name);
            console.log('Embed URL:', embedUrl);
            currentStreamUrl = embedUrl;
            // You might want to do something with the embed URL here, like display it on your page
        }
    }

    function getEmbedUrl(streamId: string): string {
        return `https://player.twitch.tv/?channel=${streamId}&parent=${domain}&muted=false`;
    }

    async function changeStream() {
        console.log('Changing stream...');
        const token = await getToken();
        await fetchRandomStream(token);
    }

    onMount(async () => {
        const token = await getToken();
        await fetchRandomStream(token);
    });
</script>
# on key left or right change stream
<section tabindex="0" on:keydown={async (e) => {
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        await changeStream();
    }
}}>
    <h1>Random Stream</h1>
    <iframe src={currentStreamUrl} width="800" height="600" frameborder="0" scrolling="no" allowfullscreen="true"></iframe>
    <h2>Past Streams</h2>
    <ul>
        {#each pastStreamUrls as url}
            <li><a href={url}>{url}</a></li>
        {/each}
    </ul>
</section>