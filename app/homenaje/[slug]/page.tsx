import TributeData from "./TributeData"

export default function TributeDetailPage({ params }: { params: { slug: string } }) {
  return <TributeData params={params} />
}

