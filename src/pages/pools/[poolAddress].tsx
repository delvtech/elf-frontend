import { GetStaticPropsContext } from "next";
import { getAllPoolAddresses, getPoolInfo } from "efi/pools/getPoolInfo";

export async function getStaticProps({ params }: GetStaticPropsContext) {
  const poolInfo = await getPoolInfo(params?.poolAddress as string);
  return {
    props: { poolInfo },
  };
}

export { PoolView as default } from "efi-ui/pools/PoolView/PoolView";

export async function getStaticPaths() {
  const addresses = getAllPoolAddresses();
  const paths = addresses.map((poolAddress) => ({
    params: { poolAddress },
  }));
  return {
    paths,
    fallback: false,
  };
}
