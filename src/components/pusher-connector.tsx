import Pusher, * as PusherTypes from "pusher-js"
import { useEffect, useState } from "react"
import { useStore } from "@/lib/store"
import { useAlby } from "@/lib/useAlby"
import { generate } from "@/lib/webllm"

export const PusherConnector = () => {
  // const { logout } = useAlby()

  const [userId, setUserId] = useState(0)

  useEffect(() => {
    let userIdString = window.sessionStorage.getItem("user_id");
    if (!userIdString) {
      // logout()
      alert("Error. Please log in again.")
    } else {
      setUserId(Number(userIdString))
    }
  }, [])


  useEffect(() => {
    if (!userId || userId === 0) return
    const pusher = new Pusher('e12c6b8ab6c32132e3bf', {
      cluster: 'mt1'
    });

    const presenceChannel = pusher.subscribe('presence-common_room');
    presenceChannel.bind('pusher:subscription_succeeded', (members: PusherTypes.Members) => {
      useStore.getState().setCount(members.count);
    });
    presenceChannel.bind('pusher:member_added', (member: any) => {
      useStore.getState().increment()
      // console.log('Member added:', member)
    });
    presenceChannel.bind('pusher:member_removed', (member: any) => {
      // console.log('Member removed:', member)
      useStore.getState().decrement()
    });

    // Subscribe to user-specific channel if userId is available
    if (userId) {
      const userChannel = pusher.subscribe(`private-user-${userId}`);
      userChannel.bind('JobAssigned', (data: any) => {
        generate(data.job)
      });
    }

  }, [userId]);

  return null
}
