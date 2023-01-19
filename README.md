# Backend source code

# Important ⚠

If you are going to add an endpoint to trigger a **Venly transaction** thats pay **gas fees** on `/game` be sure to add the `topUp` venly service on your controller to top up the user venly wallet.

```typescript
topUp(walletId: string, address: string)
```

### TODOs:

- [x] Change typeORM to mongoose.
- [x] Remove unused routes.
- [x] Remove unused entities/columns
- [x] Create VenlyService
- [x] Create MoralisService
- [x] Create QuicknodeService
- [ ] Change API key to strategy with passport
- [ ] Fix TBS integration flows
- [ ] Remove user roles and replace with `OwnerOf`
- [ ] Check @common folder structure (still feels off)
- [x] Check routing with @routes.ts
- [ ] Check if we should re-include `@nestjs/throttler`
- [ ] Replace Swagger with Postman docs + tests (to make sure docs are up to date)
- [ ] Remove all unused after these changes
- [ ] Increment coverage
- [ ] Update README documentation with better process (install + start + testing, etc)
- [ ] Change Quicknode to Moralis (wait for pricing decision)
