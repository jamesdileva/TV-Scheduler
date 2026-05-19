export const handler = async (event) => {
  const showName = event.queryStringParameters?.name;

  const res = await fetch(
    `https://api.tvmaze.com/singlesearch/shows?q=${showName}&embed=nextepisode`
  );

  const data = await res.json();

  return {
    statusCode: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
    },
    body: JSON.stringify({
      name: data.name,
      summary: data.summary,
      nextEpisode: data._embedded?.nextepisode || null,
    }),
  };
};