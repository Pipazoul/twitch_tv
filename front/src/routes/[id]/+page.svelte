<script lang="ts">
	import { page } from "$app/stores";
	import { client } from "$lib/client";
    import { useQuery } from '@triplit/svelte'
	import { onMount } from "svelte";

    let id = $page.params.id

    
    let data = useQuery(client, client.query('rooms'));
    console.log(data);
    let rooms = $derived(data.results ? Array.from(data.results.values()) : []);
    let room = $state({});

    // get screen size
    let width = window.innerWidth;
    let height = window.innerHeight;

    onMount(async () => {
        console.log(id);
        // if id is not in rooms, append it
        if (!room.id) {
            console.log('fetching room');
            let room = {id: id, name: 'room ' + id, channelHistory: []};
            console.log(room);
            client.insert('rooms', room);
        }
    });

    $effect(() => {
        console.log("rooms",rooms);
        room = rooms.find(r => r.id == id);
        console.log("room",room);
    })

</script>
<section>
    {#if room?.currentChannel?.url}
        <iframe src={room?.currentChannel.url} width={width} height={height}  frameborder="0" scrolling="no" allowfullscreen="true"></iframe>
    {:else}
        <p>No channel</p>
    {/if}
</section>