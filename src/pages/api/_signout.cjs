async function post({ request }) {
    return new Response(
        JSON.stringify({ status: 'signed_out' }),
        {
            status: 200,
            headers: {
                'content-type': 'application/json',
                'Set-Cookie': 'session=; HttpOnly; Path=/; Max-Age=0',
            },
        }
    );
}

module.exports = { post };