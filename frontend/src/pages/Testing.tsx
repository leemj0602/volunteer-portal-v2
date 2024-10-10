import axios from "axios";
import { FormEvent, useState } from "react";
import config from "../../../config.json";

export default function Testing() {
    const [content, setContent] = useState("");
    const [encrypted, setEncrypted] = useState<string>();
    const [decrypted, setDecrypted] = useState("");
    const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const response = await axios.post(`${config.domain}/portal/api/encode.php`, { data: content });
        setEncrypted(response.data as string);
    }
    
    const decrypt = async () => {
        const response = await axios.post(`${config.domain}/portal/api/decode.php`, { data: encrypted });
        console.log(response);
        setDecrypted(response.data as string);
    }

    
    return <form onSubmit={onSubmit}>
        <input type="text" value={content} onChange={e => setContent(e.target.value)} />
        <button type="submit">submit</button>
        {encrypted && <>
            Encrypted into: {encrypted}
            <button type="button" onClick={decrypt}>decrypt</button>
        </>}
        {decrypted}
    </form>
}