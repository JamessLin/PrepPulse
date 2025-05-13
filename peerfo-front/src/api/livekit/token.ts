import type { NextApiRequest, NextApiResponse } from 'next';


export default async function handler(req: NextApiRequest, res: NextApiResponse) 


{

  console.log(process.env.NEXT_PUBLIC_API_URL);
  const query = new URLSearchParams(req.query as any);
  const apiRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/livekit/token?` + query, {
    credentials: 'include',
  });
  const data = await apiRes.json();
  res.status(apiRes.status).json(data);
}
