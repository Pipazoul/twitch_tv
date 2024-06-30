<script lang="ts">
    import { page } from "$app/stores";
	import { client } from "$lib/client";
    import { useQuery } from '@triplit/svelte'
	import { onMount } from "svelte";
    import {PUBLIC_CLIENT_ID,PUBLIC_CLIENT_SECRET,PUBLIC_DOMAIN} from '$env/static/public';
    const clientId = PUBLIC_CLIENT_ID;
    const clientSecret = PUBLIC_CLIENT_SECRET;

    let id = $page.params.id
    let domain = PUBLIC_DOMAIN;


    
    let data = useQuery(client, client.query('rooms'));
    let rooms = $derived(data.results ? Array.from(data.results.values()) : []);
    let room = $state({});

    let lang = [
        {icon: '🌍', name: 'all'},
        {icon: '🇫🇷', name: 'fr'},
        {icon: '🇬🇧', name: 'en'},
        {icon: '🇪🇸', name: 'es'},
        {icon: '🇩🇪', name: 'de'},
        {icon: '🇮🇹', name: 'it'},
        {icon: '🇳🇱', name: 'nl'},
        {icon: '🇵🇹', name: 'pt'},
        {icon: '🇷🇺', name: 'ru'},
        {icon: '🇸🇪', name: 'sv'},
        {icon: '🇺🇦', name: 'uk'},
        {icon: '🇯🇵', name: 'ja'},
        {icon: '🇨🇳', name: 'zh'},
        {icon: '🇰🇷', name: 'ko'},
    ];

    let cat = [
        { name: "all", id: null },  // "all" doesn't have a specific ID as it encompasses everything
        { name: "just-chatting", id: 509658 },
        { name: "special-events", id: 518203 },
        { name: "music", id: 26936 },
        { name: "art", id: 509660 },
        { name: "travel-and-outdoors", id: 509674 },
        { name: "science-and-technology", id: 509670 },
    ];

    let langSelected = lang[0];
    let catSelected = cat[0];

    $effect(() => {
        console.log("rooms",rooms);
        room = rooms.find(r => r.id == id);
        console.log("room",room);
    })


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

        // Build the query string conditionally
        let queryParams = [];
        if (langSelected.name !== 'all') {
            queryParams.push(`language=${langSelected.name}`);
        }
        if (catSelected.name !== 'all') {
            queryParams.push(`game_id=${catSelected.id}`);
        }
        queryParams.push('first=100'); // You can keep the 'first' parameter constant
        const queryString = queryParams.join('&');
        console.log('Query string:', queryString);
        // fetch a stream from Twitch based on the selected language and category
        const req = await fetch(`https://api.twitch.tv/helix/streams?${queryString}`, {
            headers
        });
        const data = await req.json();
        console.log(data);

        // Assuming data contains an array of streams under `data.data`
        if (data.data.length > 0) {
            const randomStream = data.data[Math.floor(Math.random() * data.data.length)];
            const embedUrl = getEmbedUrl(randomStream.user_name);
            console.log('Embed URL:', embedUrl);
            await client.update('rooms', room.id, async (entity) => {
                entity.channelHistory.add(randomStream.user_name);
                entity.currentChannel = {
                    url: embedUrl,
                    name: randomStream.user_name,
                }  
            });
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

    async function pastStream(){
        console.log('Past stream...');
        // convert set to array
        let channelHistory = Array.from(room.channelHistory);
        // remove last element
        channelHistory.pop();
        // get last element
        let lastChannel = channelHistory[channelHistory.length - 1];
        console.log('Last channel:', lastChannel);
        // remove last element from channelHistory
        await client.update('rooms', room.id, async (entity) => {
            entity.channelHistory = new Set(channelHistory);
            entity.currentChannel = {
                url: getEmbedUrl(lastChannel),
                name: lastChannel,
            }
        });
    }

    onMount(async () => {
        const token = await getToken();
        if(room?.currentChannel == "") {
            await fetchRandomStream(token);
        }
    });

</script>
<section>
    <h1 class="uppercase text-2xl">Remote {room?.id || "Not found"}</h1>
    <div class="flex flex-col items-center space-y-6 justify-center p-4 border rounded-md m-2">
        <div>
            <select bind:value={langSelected} class="select select-bordered w-full max-w-xs">
                {#each lang as l}
                    <option value={l}>{l.icon} {l.name}</option>
                {/each}
            </select>
            <select bind:value={catSelected} class="select select-bordered w-full max-w-xs">
                {#each cat as c}
                    <option value={c}>{c.name}</option>
                {/each}
            </select>
        </div>
        <div class="flex flex-col w-3/4 space-y-3">
            <button class="btn uppercase" on:click={changeStream}>Next stream ⏩</button>
            <button class="btn uppercase" on:click={pastStream}>⏪ Past stream</button>
        </div>
    </div>
</section>