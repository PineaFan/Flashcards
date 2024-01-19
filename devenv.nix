{ pkgs, ... }:
{
  services.postgres = {
    enable = true;
    package = pkgs.postgresql_15;
    initialDatabases = [{ name = "flashcards"; }];
    port = 5432;
    listen_addresses = "127.0.0.255";
  };
}
