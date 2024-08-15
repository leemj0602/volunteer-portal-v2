interface ConfigProps {
    domain: string;
    email?: string;
}

const config: ConfigProps = {
    domain: "http://localhost/wordpress",
    email: "casuarina@octopus8.com"
}

export default config;