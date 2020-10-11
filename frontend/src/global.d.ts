interface Window {
  /**
   * Injected wallet providers like MetaMask provide an ethereum client
   * directly on window. When users interact directly w/ their wallet plugin,
   * we can listen for events on this client to sync our app state.
   */
  ethereum: any;
}
