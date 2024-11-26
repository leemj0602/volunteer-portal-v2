import { useParams } from "react-router-dom";
import Wrapper from "../../components/Wrapper";
import { useEffect, useState } from "react";
import ServiceInfoPackManager, { ServiceInfoPack } from "../../../utils/managers/ServiceInfoPackManager";
import Loading from "../../components/Loading";
import styles from "./sip.module.css";

export default function SIP() {
  const { id } = useParams();
  const [sip, setSip] = useState<ServiceInfoPack>();
  useEffect(() => {
    (async () => {
      const sip = await ServiceInfoPackManager.fetch({ id });
      setSip(sip);
    })();
  }, [id]);

  return <Wrapper location="/patient/service-info-packs">
    {!sip ? <Loading className="h-screen items-center" /> : <div className="w-full px-0 md:px-6 max-w-[1200px] mx-auto">
      <div className="py-4">
        <div className="p-8 bg-white rounded-md">
          <h1 className="text-2xl mb-4 font-semibold text-secondary">{sip.subject}</h1>
          <div className={styles.container} dangerouslySetInnerHTML={{ __html: sip.details }} />
        </div>
      </div>
    </div>}
  </Wrapper>
}