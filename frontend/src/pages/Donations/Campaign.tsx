import { useParams } from "react-router-dom";
import Wrapper from "../../components/Wrapper";

export default function Campaign() {
  const { id } = useParams();

  return <Wrapper location="/donor/campaigns">

  </Wrapper>
}