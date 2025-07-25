import { stripe } from "@/lib/stripe";
import {
  ImageContainer,
  ImagesWrapper,
  SuccessContainer,
} from "@/styles/pages/success";
import { GetServerSideProps } from "next";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import Stripe from "stripe";

interface SuccessProps {
  customerName: string;
  products: {
    name: string;
    imageUrl: string;
  }[];
}

export default function Success({ customerName, products }: SuccessProps) {
  return (
    <>
      <Head>
        <title>Compra efetuada | Ignite Shop</title>
        <meta name="robots" content="noindex" />
      </Head>

      <SuccessContainer>
        <h1>Compra efetuada</h1>

        <ImagesWrapper>
          {products.map((product, index) => (
            <ImageContainer key={index}>
              <Image src={product.imageUrl} width={120} height={110} alt="" />
            </ImageContainer>
          ))}
        </ImagesWrapper>

        <p>
          Uhuul <strong>{customerName}</strong>, sua compra de{" "}
          <strong>{products.length}</strong>{" "}
          {products.length === 1 ? "camiseta" : "camisetas"} já está a caminho
          da sua casa.
        </p>

        <Link href="/">Voltar ao catálogo</Link>
      </SuccessContainer>
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ query }) => {
  if (!query.session_id) {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }

  const sessionId = String(query.session_id);

  const session = await stripe.checkout.sessions.retrieve(sessionId, {
    expand: ["line_items", "line_items.data.price.product"],
  });

  const customerName = session.customer_details?.name ?? "";

  const products =
    session.line_items?.data?.map((item) => {
      if (!item.price || !item.price.product) {
        return { name: "", imageUrl: "" };
      }
      const product = item.price.product as Stripe.Product;
      return {
        name: product.name,
        imageUrl: product.images[0],
      };
    }) ?? [];

  return {
    props: {
      customerName,
      products,
    },
  };
};
