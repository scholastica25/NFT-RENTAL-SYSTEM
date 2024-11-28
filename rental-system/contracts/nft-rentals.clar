;; NFT Rental System

;; Constants
(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u100))
(define-constant err-not-token-owner (err u101))
(define-constant err-token-not-found (err u102))
(define-constant err-already-rented (err u103))
(define-constant err-not-rented (err u104))
(define-constant err-rental-expired (err u105))

(define-constant err-insufficient-funds (err u106))
(define-constant err-invalid-rental-duration (err u107))
(define-constant err-cannot-transfer-rented-nft (err u108))

;; Data Variables
(define-data-var next-rental-id uint u0)

(define-data-var max-rental-duration uint u144) 

;; Define the NFT
(define-non-fungible-token rented-nft uint)

;; Define Maps
(define-map rentals
  uint
  {
    owner: principal,
    renter: (optional principal),
    token-id: uint,
    rental-start: uint,
    rental-end: uint,
    price: uint,
    is-active: bool
  }
)

(define-map token-rental uint uint)

(define-map rental-escrow 
  {
    rental-id: uint, 
    renter: principal
  }
  uint
)




;; Read-only functions
(define-read-only (get-rental (rental-id uint))
  (map-get? rentals rental-id)
)

(define-read-only (get-token-rental (token-id uint))
  (map-get? token-rental token-id)
)

(define-read-only (get-max-rental-duration)
  (var-get max-rental-duration)
)

;; Admin functions
(define-public (set-max-rental-duration (new-duration uint))
  (begin
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (var-set max-rental-duration new-duration)
    (ok true)
  )
)

;; Public functions
(define-public (create-rental (token-id uint) (duration uint) (price uint))
  (let
    (
      (rental-id (var-get next-rental-id))
    )
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (asserts! (is-none (map-get? token-rental token-id)) err-already-rented)
    (try! (nft-mint? rented-nft rental-id tx-sender))
    (map-set rentals
      rental-id
      {
        owner: tx-sender,
        renter: none,
        token-id: token-id,
        rental-start: u0,
        rental-end: u0,
        price: price,
        is-active: true
      }
    )
    (map-set token-rental token-id rental-id)
    (var-set next-rental-id (+ rental-id u1))
    (ok rental-id)
  )
)

(define-public (rent-nft (rental-id uint))
  (let
    (
      (rental (unwrap! (map-get? rentals rental-id) err-token-not-found))
      (price (get price rental))
    )
    (asserts! (is-none (get renter rental)) err-already-rented)
    (try! (stx-transfer? price tx-sender (get owner rental)))
    (map-set rentals
      rental-id
      (merge rental {
        renter: (some tx-sender),
        rental-start: block-height,
        rental-end: (+ block-height (get rental-end rental))
      })
    )
    (ok true)
  )
)

(define-public (end-rental (rental-id uint))
  (let
    (
      (rental (unwrap! (map-get? rentals rental-id) err-token-not-found))
    )
    (asserts! (is-some (get renter rental)) err-not-rented)
    (asserts! (>= block-height (get rental-end rental)) err-rental-expired)
    (try! (nft-transfer? rented-nft rental-id (get owner rental) (unwrap! (get renter rental) err-not-rented)))
    (map-delete token-rental (get token-id rental))
    (map-delete rentals rental-id)
    (ok true)
  )
)


(define-public (cancel-rental (rental-id uint))
  (let
    (
      (rental (unwrap! (map-get? rentals rental-id) err-token-not-found))
    )
    (asserts! (is-eq tx-sender (get owner rental)) err-not-token-owner)
    (asserts! (is-none (get renter rental)) err-already-rented)
    (try! (nft-burn? rented-nft rental-id tx-sender))
    (map-delete token-rental (get token-id rental))
    (map-delete rentals rental-id)
    (ok true)
  )
)
