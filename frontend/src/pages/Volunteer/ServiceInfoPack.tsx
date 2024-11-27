import Wrapper from "../../components/Wrapper";
import config from "../../../../config.json";
import { useState } from "react";
import Loading from "../../components/Loading";

export default function VolunteerInfoPack() {
  const [loading, setLoading] = useState(true);
  const handleFrameLoad = () => {
    setLoading(false);
  }
  
  return <Wrapper>
    {loading && <Loading className="h-screen items-center" />}
    <iframe onLoad={handleFrameLoad} className="h-screen w-full" src={`${config.domain}/index.php/volunteer-service-info-pack/`} />
  </Wrapper>
}