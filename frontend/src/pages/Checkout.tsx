import React, { useState, useEffect } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import axios from "axios";
import config from "../../../config";
import { useParams } from "react-router-dom";
import Wrapper from "../components/Wrapper";

const promise = loadStripe("pk_test_51PoK8yIWRO1wD2nNRseVeYLNAslyUb1cuRr8H4ZreTTPJAumlZS3Hqp2xKRONDKvKLATBTfvA8JK5vw6Y2vWB3UR00Cmt8K7yO");

export default function Checkout() {
    const { id } = useParams();
    const [clientSecret, setClientSecret] = useState("");
    console.log(id);

    useEffect(() => {
        // (async () => {
        //     const response = await axios.post(`${config.domain}/portal/api/create.php`, 
        //         { items: [{ id: "" }]}
        //     )

        // })();
    })
    
    return <Wrapper>
        <></>
    </Wrapper>
}