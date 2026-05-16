export const handler = async () => {
  try {
    const response = await fetch("https://api.tvmaze.com/schedule");
    const data = await response.json();

    const formatted = data.map((item) => ({
      showId: item.show.id,
      showName: item.show.name,
      season: item.season,
      episode: item.number,
      episodeName: item.name,
      airTime: item.airtime,
    }));

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify(formatted),
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({
        error: "Failed to fetch schedule",
        message: error.message,
      }),
    };
  }
};