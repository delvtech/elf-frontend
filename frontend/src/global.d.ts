interface Window {
  /**
   * Injected wallet providers like MetaMask provide an ethereum client
   * directly on window. When users interact directly w/ their wallet plugin,
   * we can listen for events on this client to sync our app state.
   */
  consoleEther: (name: string, value: BigNumber | undefined) => void;
  ethereum: any;
  /**
   * web3react context object.  placed on global for easier debugging
   */
  __web3React: any;
}
