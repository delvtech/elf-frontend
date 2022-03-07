import { GetStaticPropsContext, GetStaticPropsResult } from "next";

export { FixedRatesListView as default } from "ui/fixedrates/FixedRatesListView";

export async function getStaticProps({
  params,
}: GetStaticPropsContext): Promise<GetStaticPropsResult<{}>> {
  console.log(params);
  return { props: {} };
}
