import {Provider, Wallet} from './config';


async function main() {
  return await Provider.fetchAccountInfo(Wallet.getChangeAddress());
}

main()
  .then((a) => {
    console.log(a);
  })
  .catch((err) => {
    console.error(err);
  });