interface ConfigProps {
    version: number;
    domain: string;
    email?: string;
}

const config: ConfigProps = {
    version: 1,
    domain: "http://localhost/wordpress",
    email: "casuarina@octopus8.com"
}

export default config;