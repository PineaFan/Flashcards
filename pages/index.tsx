import React from 'react';
import { kv } from "@vercel/kv";
import { useSession, signIn, signOut } from 'next-auth/react';

import { Card, CardRow } from '../components/card';

export default function Index(props: { value: string }) {
    const { value } = props;
    const { data: session } = useSession()
    if (session && session.user) {
        return <>
            <img src={session.user.image || "https://assets.clicks.codes/bots/rsm/normal.png"} height={64} width={64} alt="user image" />
            Signed in as {session.user.email} <br />
            <p>Name: {session.user.name}</p>
            <p>User ID: {session.user.userId}</p>
            <p>Provided Token: {session.user.providerId}</p>
            <p>Provider: {session.user.authProvider}</p>
            <button onClick={() => signOut()}>Sign out</button>
            <CardRow>
                <Card title="card 1" description="card 1 description. This one has more text so that I can test if it overflows onto the next line! Isn't that cool?" colour={"red"}/>
                { /* Optionally, an icon could be provided here */ }
                <Card title="card 2" description="card 2 description" colour={"yellow"} roundIcon={true} icon={"https://assets.clicks.codes/bots/rsm/normal.png"}/>
                {/* Or it could be a dashed one instead */}
                <Card title="card 3" description="card 3 description" dashed={"F27878"} colour={"cyan"} buttons={[{text: "Example", url: "example.com"}]} />
                {/* And any can include buttons */}
                <Card title="card 4" description="card 4 description" colour={"green"} buttons={[
                    {text: "Example", url: "example.com"},
                    {text: "Example 2", url: "example.com", colour: "F27878", textColour: "FFFFFF"}
                ]} />
                {/* Now to show off simply the colours */}
                <Card title="Red" description="card 5 description" colour={"red"} />
                <Card title="Green" description="card 6 description" colour={"green"}  />
                <Card title="Blue" description="card 7 description" colour={"blue"} />
                <Card title="Yellow" description="card 8 description" colour={"yellow"} />
                <Card title="Purple" description="card 9 description" colour={"purple"} />
                <Card title="Cyan" description="card 10 description" colour={"cyan"} />
                <Card title="Orange" description="card 11 description" colour={"orange"} />
                <Card title="Grey" description="card 12 description" colour={"grey"} />
                <Card title="Black" description="card 13 description" colour={"black"} />
                <Card title="Pink" description="card 14 description" colour={"pink"} />
            </CardRow>
        </>

    }
    return <>
        Not signed in <br />
        <button onClick={() => signIn()}>Sign in</button>
    </>
}


export async function getServerSideProps() {
    const value = 2;
    return {
        props: {
            value
        }
    }
}
