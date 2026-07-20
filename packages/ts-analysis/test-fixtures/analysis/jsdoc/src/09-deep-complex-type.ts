/**
 * API response.
 */
export interface ApiResponse {
  /**
   * Response payload.
   */
  data: {
    /**
     * Users.
     */
    users: Array<{
      /**
       * User id.
       */
      id: string

      /**
       * User name.
       */
      name: string
    }>

    /**
     * Service actions.
     */
    actions: {
      /**
       * Finds user.
       */
      findUser: (
        /**
         * User id.
         */
        id: string,
      ) => {
        /**
         * Found user id.
         */
        id: string

        /**
         * Found user name.
         */
        name: string
      }

      /**
       * Notifies user.
       */
      notify: (
        /**
         * Message.
         */
        message: string,

        /**
         * Completion callback.
         */
        callback: (
          /**
           * Success flag.
           */
          success: boolean,
        ) => void,
      ) => void
    }
  }
}
