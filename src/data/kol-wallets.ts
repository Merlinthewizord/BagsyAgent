/**
 * KOL (Key Opinion Leader) wallet addresses for copy trading
 *
 * These wallets are tracked and their trades are automatically copied
 * with the bot's configured position sizing and profit targets.
 */

export interface KOLWallet {
  address: string;
  name?: string;
  emoji?: string;
  winRate?: number;
  totalPnL?: number;
  numTrades?: number;
  roi?: number;
  avgTradeSize?: number;
  lastActive?: string;
  tags?: string[];
}

/**
 * List of wallets to copy trade
 * All trades from these wallets will be mirrored with 0.01 SOL position size
 */
export const KOL_WALLETS: KOLWallet[] = [
  { address: "FtGWiQYZR8h1yVoSApwY2JPVrWXc7BJyvyiS3Xr1yZ7C", name: "void", emoji: "👻" },
  { address: "BHkqZzSzmQiNkehGUA3Krufmq5KGxdkNfRNCock6jbv1", name: "Marz", emoji: "👻" },
  { address: "9TfRYUWoro1DiHGry3bdKDbvu2tXfarCXy8dnidi57VY", name: "dummydev", emoji: "👻" },
  { address: "xXpRSpAe1ajq4tJP78tS3X1AqNwJVQ4Vvb1Swg4hHQh", name: "a", emoji: "🦢" },
  { address: "3kebnKw7cPdSkLRfiMEALyZJGZ4wdiSRvmoN4rD1yPzV", name: "bastille", emoji: "🦘" },
  { address: "DNi79FNyj7RfjgoVgUNW7bg3GZL1c61U47QfGHw4Bd2n", name: "JLOVE ALT", emoji: "💵" },
  { address: "215nhcAHjQQGgwpQSJQ7zR26etbjjtVdW74NLzwEgQjP", name: "AP", emoji: "😀" },
  { address: "5Uwt68TYZuoB3LQ9WwCVsMy2Vuw8gw3TkTdiE7i5EA6A", name: "very g ai wal", emoji: "👾" },
  { address: "5YkZmuaLhrPjFv4vtYE2mcR6J4JEXG1EARGh8YYFo8s4", name: "omtad maybe", emoji: "😀" },
  { address: "5zBpuvaFxM1ENbeB3GdxQbRMc5tr3phNgAvrhEkkAQDg", name: "pump hack dev", emoji: "😀" },
  { address: "7tiRXPM4wwBMRMYzmywRAE6jveS3gDbNyxgRrEoU6RLA", name: "qt", emoji: "🥃" },
  { address: "CDNt6H6J7ZBWVjyKJmFRjcJAoHa6XKrn2mTLK3DZwnqL", name: "marc", emoji: "👑" },
  { address: "CgoUBvppFXKMbimghUrKXeGWh8JE1BQDcWidjJqn1UzH", name: "tiny dev", emoji: "😀" },
  { address: "CokBqb4FiMNQzVETTJWCUMTXyTSJhu7HSoPxtVT8TzGr", name: "fart dog dev", emoji: "😀" },
  { address: "EHg5YkU2SZBTvuT87rUsvxArGp3HLeye1fXaSDfuMyaf", name: "TIL", emoji: "🍤" },
  { address: "ErSbFLkD8XhfCcVSWuFXkW5sRU8CDQWLx2y4TF1HLQae", name: "Bernie potion", emoji: "⚪️" },
  { address: "AVAZvHLR2PcWpDf8BXY4rVxNHYRBytycHkcB5z5QNXYm", name: "maybe ansem", emoji: "😀" },
  { address: "HD5fsofvcEaSimExUkPQxYPec3nT8g2tP2tw8oGPrpBT", name: "admiralant", emoji: "👾" },
  { address: "HrTZPWV4ZPebBiwyzoTBajCD49kQqVwf4dwsLuYG8CXX", name: "killz", emoji: "🔫" },
  { address: "4JU1YDGTGzNvB4fEZ3DYALhp5dcBPpavrp76HdzHttQx", name: "Retard Whale", emoji: "🐳" },
  { address: "8X3brvuGNQrA78i4kGdYwSaZRbGvAaef8g3gESnWnL5n", name: "BASED DEV", emoji: "😀" },
  { address: "3jN1M8gWLk2ryTGnscrcwRK1Gy4Ttzq5QizWT8uizZsT", name: "NEON", emoji: "⚡️" },
  { address: "F72vY99ihQsYwqEDCfz7igKXA5me6vN2zqVsVUTpw6qL", name: "Jalen", emoji: "🤖" },
  { address: "GU1L881nqwM3tYyTXoTCuDitJas8hBYKpiAWzdB7MaoC", name: "sentai dev", emoji: "😀" },
  { address: "GZSAEKJ1SxD7VsA46TxxAEtAvhxwMPkqkZKL1FVTNCHA", name: "h", emoji: "😀" },
  { address: "4PNr4uqAgN9gHnhhYgq1XsmFCAiWjtYWKFMszJyi45pt", name: "wallet 4", emoji: "😅" },
  { address: "2NnG7eK8zRg6tsksdwY5PKo8MLYf9wEPwNbhte3EZEFr", name: "Xeno", emoji: "👻" },
  { address: "As7HjL7dzzvbRbaD3WCun47robib2kmAKRXMvjHkSMB5", name: "otta", emoji: "👻" },
  { address: "4XMPyWFsYdNcCN4FG8geyytyTeUNacn4QundBzMqbGGT", name: "statics", emoji: "😈" },
  { address: "2eYsRzXZqCD2BXFLDHjVuWGT1DiPQkuDdCc2ZN7whPdf", name: "c&k", emoji: "👻" },
  { address: "5B79fMkcFeRTiwm7ehsZsFiKsC7m7n1Bgv9yLxPp9q2X", name: "bandit", emoji: "🥷" },
  { address: "8rvAsDKeAcEjEkiZMug9k8v1y8mW6gQQiMobd89Uy7qR", name: "casino", emoji: "🎲" },
  { address: "GGmHfzAWo5H2F5kuvWRdqia4K51inHYqXH81AisA2VZ4", name: "Titus", emoji: "👻" },
  { address: "6Z2fBjQuh9RGZuR7kTzGamq8ztiaPAtuabKHedPxyVGY", name: "Rawn", emoji: "👻" },
  { address: "Aj7MNbBze7NWLkWzAvboNxxBWZrvN4Tn9aoDw1QD87hG", name: "Mayor", emoji: "👻" },
  { address: "2j7mcRBu8F1VSdVCefqwbPX6ztqJQpE8Fik4XnarEyPQ", name: "Itachi", emoji: "👻" },
  { address: "BDC19MFbzDpoF37QCxe4JR6i7UmXNMSiEqrxuQgJoWte", name: "zerebro 100k", emoji: "😀" },
  { address: "BFTCyf9BfP8WWuheCBoRfBWKz54JQ2aSQoGz1MGwwMNT", name: "dave 3", emoji: "👁️‍🗨️" },
  { address: "DotZ4toJSViUda1gLjauZRiBcuz7qqDiFeyYrkfw762z", name: "mungo 3", emoji: "😀" },
  { address: "6cpADLEZ9kgVD4yDFMxCsSV7eNnkagkF2dfVL9LXtNzG", name: "cented", emoji: "😂" },
  { address: "6RoLbZJWJHpTk4sdPsWzocEHiRtzPS36WcBjnMXuQrfU", name: "6RoLBZJW", emoji: "😀" },
  { address: "7DkYsg1uyNCp7HeSy6wdN8wcGoV5x7VAGMur2Aa7wtVY", name: "crazygg", emoji: "💨" },
  { address: "7ugQtN6GtkKoMHAb3i4rf9uERpVgPyV3Er2wBc8AnSem", name: "shotta", emoji: "🥵" },
  { address: "91HANKimRsWTXMkfcDipLaDVmeTkj6m2eNSVobpkdUNz", name: "Terp", emoji: "🤑" },
  { address: "G3g1CKqKWSVEVURZDNMazDBv7YAhMNTjhJBVRTiKZygk", name: "insyder", emoji: "👺" },
  { address: "FFbqwXEwbqy4AC2SEh925rYvjWwjLe2jkb4mr7opqmWM", name: "cented friend", emoji: "😀" },
  { address: "3xdgWLzZ9dY99o6yaLWjugCH1QTo6czjGK1nAbFQe91r", name: "Meme Messiah", emoji: "👻" },
  { address: "D7qDkHJpANcN6FCfi1Z59iM5UeMqguJweFCE8byRMrik", name: "zuro dev wal", emoji: "😀" },
  { address: "F2SuErm4MviWJ2HzKXk2nuzBC6xe883CFWUDCPz6cyWm", name: "earl", emoji: "🌲" },
  { address: "EtcX2zaFKZtcdM6VFCMpaSsjvgWomL3wG1W28Acht6pa", name: "cr4zy", emoji: "😀" },
  { address: "FKY9K9K2WjXP5i4FrAo3EZsyfqV4u9CjQAwj59QXh8Uv", name: "nosh", emoji: "😎" },
  { address: "4aDdi3EiDPMbeZ3e5BvbFMt4vfJaoahaHxZuwKQRtFc1", name: "nach challenge", emoji: "🚀" },
  { address: "3GFv4epVqH4EzDbTuQHAkCZdTjscqf2B7eyodYk5GW7E", name: "styx maybe", emoji: "😀" },
  { address: "7ABz8qEFZTHPkovMDsmQkm64DZWN5wRtU7LEtD2ShkQ6", name: "RED", emoji: "🔴" },
  { address: "EB9rURAEFFHHvcuTig6R2jfaPMzWWwmRnzeoPnigGer", name: "Mort", emoji: "😿" },
  { address: "GZVSEAajExLJEvACHHQcujBw7nJq98GWUEZtood9LM9b", name: "washy dev", emoji: "🧼" },
  { address: "H4Y7jRyApBWv4cnG7fw7UVujktRAGWEbES4wMWUT6zjq", name: "Malik (potion)", emoji: "🦑" },
  { address: "pigkea5w3wnxFvsitH8WScRV8jPKN2HaiCtvYoQk3kB", name: "omtad", emoji: "🐴" },
  { address: "G2VzymsKt3zNAn4CKBndYcS67w6Kny5sDEp7Y2W1aTf6", name: "Terp photon", emoji: "🎲" },
  { address: "G9fmyVHqWS94YRfyQjYVUdf8oPufkoxbUWCLiHJyR8Br", name: "Mira Whale", emoji: "😀" },
  { address: "GQWLRHtR18vy8myoHkgc9SMcSzwUdBjJ816vehSBwcis", name: "joji", emoji: "🤑" },
  { address: "AmKoRjpAqKmTHeA4xvq3UDfCaUH5CgfMTLURS9y7CkxF", name: "WEDEMBOYZ", emoji: "👦" },
  { address: "5o5P6jK1suNxykvh8Rj8JLYCPTi5HRNrpTvRmHw9iZsC", name: "Nosh", emoji: "😀" },
  { address: "99i9uVA7Q56bY22ajKKUfTZTgTeP5yCtVGsrG9J4pDYQ", name: "zrool", emoji: "⛏️" },
  { address: "4nvNc7dDEqKKLM4Sr9Kgk3t1of6f8G66kT64VoC95LYh", name: "bert", emoji: "😀" },
  { address: "EDmbDc7sY87dKszqyZ3rHczWbKcCyUvJQSJpE3Cg4RcZ", name: "dumb holder", emoji: "🌐" },
  { address: "636N7frU8bUwYfyUAtvMQQsXhTFRuSWjxnEZihr5axGV", name: "decent ai trade", emoji: "😀" },
  { address: "CRVidEDtEUTYZisCxBZkpELzhQc9eauMLR3FWg74tReL", name: "frankdegods", emoji: "🏁" },
  { address: "DygBZFmF6z16nXywkvM2X3PB4mgLiTSdwJisV1jcfwc2", name: "good ai trader", emoji: "🤖" },
  { address: "EaVboaPxFCYanjoNWdkxTbPvt57nhXGu5i6m9m6ZS2kK", name: "danny", emoji: "😀" },
  { address: "EwTNPYTuwxMzrvL19nzBsSLXdAoEmVBKkisN87csKgtt", name: "gake alt", emoji: "👻" },
  { address: "HsfSzb7BBv4oKNFamgoyBEQ4v6BHUhEREEmBnWzZJXLj", name: "wylie", emoji: "🐸" },
  { address: "9NgTj8cSwGMv4o4LenodqjKa3Rh6GDMPEuxSi8qvUcRw", name: "blkwe f1", emoji: "👻" },
  { address: "CZUJVKBWNjz5zU97Abhk7Dq4PhhvWmGpMXuFvLRqZm13", name: "balkwef2", emoji: "👻" },
  { address: "AF3vgksWgZzTjYbt7ZX2wjTDKnZGzU4BgD3g9DteVgZv", name: "Betrayer", emoji: "👻" },
  { address: "2QwCvtKyVew25mvDDJDwgopMhwRmNQqqGDsjCBVACo8A", name: "joji", emoji: "🥑" },
  { address: "37mYULLB3tkX1S3pW9LFWWrzC9Zw848zr48gancVJH6Z", name: "Cr4zy_Sol", emoji: "🥶" },
  { address: "4U7WKe5o8ScS8n6Gy5tEmTdfsKHYeRNiKbqZ38Kp99Ps", name: "union", emoji: "😶" },
  { address: "4zq1iLpmepj2Rj7W6A3XQMRQA1HyjYqVpZiBzM6aPyH7", name: "orangie", emoji: "😀" },
  { address: "27f89anBgqQnEbfftN8NsZPvY3n6Hvw7F4LajgjRgrWv", name: "good ai 5", emoji: "😇" },
  { address: "2AicNQ2LSEkSsFPxq4JnGrZLbbHyT2dqkhDaWX2SJ84U", name: "turco", emoji: "🤌" },
  { address: "2CXbN6nuTTb4vCrtYM89SfQHMMKGPAW4mvFe6Ht4Yo6z", name: "Moneymaykah", emoji: "🤑" },
  { address: "2cxjRs8bt5EBxbcSJkY1AXLX5UCYq23pWn83EckDMdCv", name: "4 mil ai", emoji: "🦎" },
  { address: "Ah7SnagSabPNPvkcciYwqqyCR1ymMVW3C9tFvJea1kzV", name: "Maybe Elon", emoji: "😀" },
  { address: "bookzww4H3L4eDR9qLz52vGLLLAnDwHm8zKf6qec2Xy", name: "Orangie", emoji: "🍊" },
  { address: "EwtV3vMC94rtQvH8bck5tVKHqKoYqybfo37FwMoboem6", name: "2", emoji: "😀" },
  { address: "FaqvN6wyTrabBxLP4UCux675YxKZWZaMHr1C3pHzHKhk", name: "prof 2", emoji: "😀" },
  { address: "2F19ZXrvQDCoYXdBoFBiBcEmgrAKYAheZHnQxZksHQhN", name: "Solarnius", emoji: "🌎️" },
  { address: "2M99z5JqSGSa6nCbYG5h9kksnsaAEc86Vfo5mrjgxQdU", name: "prof 3", emoji: "🤑" },
  { address: "34qXg7fx9AJDmBA1fRs8xMsfNvWQbabkdkEWfGSRpump", name: "waddles", emoji: "😀" },
  { address: "5q7Xwc2T57sK1DKU6zuwVXvMPsxqB2xrJ3T5AonFYtcY", name: "Maybe Insider", emoji: "🤑" },
  { address: "5rkPDK4JnVAumgzeV2Zu8vjggMTtHdDtrsd5o9dhGZHD", name: "MAIN DAVE", emoji: "🧨" },
  { address: "26kZ9rg8Y5pd4j1tdT4cbT8BQRu5uDbXkaVs3L5QasHy", name: "orangie nov", emoji: "🍊" },
  { address: "28ipXVfkdmu1PDowCHbcSfzkpH9edZmSiVoDhY5xGVfR", name: "mim versus", emoji: "✨️" },
  { address: "2zfBw9bBvP7N1b5E7DtoBnbD6tw5m7D8wMZzWTpBFu9G", name: "SWEEP", emoji: "💯" },
  { address: "3rSZJHysEk2ueFVovRLtZ8LGnQBMZGg96H2Q4jErspAF", name: "staqi", emoji: "😀" },
  { address: "4Be9CvxqHW6BYiRAxW9Q3xu1ycTMWaL5z8NX4HR3ha7t", name: "mitch", emoji: "😀" },
  { address: "4hSXPtxZgXFpo6Vxq9yqxNjcBoqWN3VoaPJWonUtupzD", name: "goodtrader 1", emoji: "😵‍💫" },
  { address: "5TuiERc4X7EgZTxNmj8PHgzUAfNHZRLYHKp4DuiWevXv", name: "rev", emoji: "😀" },
  { address: "7WPh1x5WzHNuiv8xnwHGyys2VJV43YRFGwEJJYLiJ26", name: "sat 1", emoji: "😀" },
  { address: "7YUQ848hDttbzwQc3SewtuaC8hgA8csDiuEZV4t9ekMm", name: "alive dev", emoji: "😀" },
  { address: "831yhv67QpKqLBJjbmw2xoDUeeFHGUx8RnuRj9imeoEs", name: "trey", emoji: "🤠" },
  { address: "8CMdc2hZ9GSxKmtGDifZ9n6DXbrUjRyxsuxYF6etpump", name: "Insenton Grand FNF", emoji: "🔥" },
  { address: "7Dt5oUpxHWuKH8bCTXDLz2j3JyxA7jEmtzqCG6pnh96X", name: "LEENS100X", emoji: "😀" },
  { address: "7SDs3PjT2mswKQ7Zo4FTucn9gJdtuW4jaacPA65BseHS", name: "insentos grandfnf", emoji: "😀" },
  { address: "6JdYLQJZ3cHKq4C1VcCmr54uBbsGXN3QSNSd8Vysp7n7", name: "sigma boy dev", emoji: "😀" },
  { address: "6m5sW6EAPAHncxnzapi1ZVJNRb9RZHQ3Bj7FD84X9rAF", name: "js", emoji: "⚡️" },
  { address: "6S8GezkxYUfZy9JPtYnanbcZTMB87Wjt1qx3c6ELajKC", name: "Nyrox", emoji: "😀" },
  { address: "6uQZEofysG1DXs3TPs1NhyLaLV4PqiWJmVAam5MD4NYL", name: "ai cabal 3", emoji: "😳" },
  { address: "8Esz91YEV2drYEqdnGR1oJJdPVhHSARbWK3JYavDF197", name: "proxy", emoji: "😀" },
  { address: "8gR76QqYvcNUyUcr2KemeyjEDGEzShUbmAgfS3mUJfNH", name: "donut dog dev", emoji: "🍩" },
  { address: "8iRuMD31AxPHHVGhDNbKHdRnuYriBMHCQbNHVfGy4PTz", name: "TJR", emoji: "🍍" },
  { address: "8KgyjCWeTfU1drKWTACpUfp1R7vxJx5U1TMd84ku1A4o", name: "dream dev wall", emoji: "😀" },
  { address: "8MaVa9kdt3NW4Q5HyNAm1X5LbR8PQRVDc1W8NMVK88D5", name: "Dauman", emoji: "😀" },
  { address: "8uYTcLKsMV1uyQTKuwXDg6nn1WvivUS5ypLVxhN44Jwv", name: "Martin", emoji: "🦍" },
  { address: "CxYnj3PerhMXoQ1apZ4KEaMGAvtJ4MwSMd4H7Yr4nYNm", name: "ai cabal 4", emoji: "🥵" },
  { address: "F5jWYuiDLTiaLYa54D88YbpXgEsA6NKHzWy4SN4bMYjt", name: "mercy", emoji: "🔔" },
  { address: "FH2x6xnoQLdUpH9r6RdZ9MchL31zw7VPBobFG845cJBL", name: "high % ai trade", emoji: "🤸" },
  { address: "FRbUNvGxYNC1eFngpn7AD3f14aKKTJVC6zSMtvj2dyCS", name: "henny", emoji: "😀" },
  { address: "FSz5yWeoccnFtfEyPP3q9QE87Pj49f5pChED4BBDsYmn", name: "trin dev wallet", emoji: "😀" },
  { address: "FX7WHi7PNMJpALRcJfG2YwjawCj6dbB9XnqbjUfjpJ4z", name: "good ai trader", emoji: "😀" },
  { address: "Fz2eT2nq1743zSfuWW7eiR48qBGzrYstH3p1CRy7ttvp", name: "95% win rate", emoji: "🐐" },
  { address: "G5nxEXuFMfV74DSnsrSatqCW32F34XUnBeq3PfDS7w5E", name: "insider", emoji: "😀" },
  { address: "5TMR5GFPTzkNhprnty2ocXEFLoLur1uchg4NkEr5WEf4", name: "zookes", emoji: "😀" },
  { address: "6LChaYRYtEYjLEHhzo4HdEmgNwu2aia8CM8VhR9wn6n7", name: "ASSASIN", emoji: "🔹" },
  { address: "73LnJ7G9ffBDjEBGgJDdgvLUhD5APLonKrNiHsKDCw5B", name: "waddles", emoji: "😀" },
  { address: "86AEJExyjeNNgcp7GrAvCXTDicf5aGWgoERbXFiG1EdD", name: "publix", emoji: "😀" },
  { address: "8deJ9xeUvXSJwicYptA9mHsU2rN2pDx37KWzkDkEXhU6", name: "Cooker Flips", emoji: "🚩" },
  { address: "8yJFWmVTQq69p6VJxGwpzW7ii7c5J9GRAtHCNMMQPydj", name: "NY", emoji: "🐋" },
  { address: "8zFZHuSRuDpuAR7J6FzwyF3vKNx4CVW3DFHJerQhc7Zd", name: "pow", emoji: "🐳" },
  { address: "9FE8V34esAoosqYqyV3fRGoPrfuR6WtH9TAhk31HJ7G8", name: "le bandit", emoji: "😀" },
  { address: "9HhafAZc6jo6rXxeJ7F4RN1BQfsTm6xLRs6YYAq6nhAn", name: "Ryan Fournier", emoji: "😀" },
  { address: "9jyqFiLnruggwNn4EQwBNFXwpbLM9hrA4hV59ytyAVVz", name: "nach", emoji: "💶" },
  { address: "9UWZFoiCHeYRLmzmDJhdMrP7wgrTw7DMSpPiT2eHgJHe", name: "1m barsik", emoji: "😀" },
  { address: "AbcX4XBm7DJ3i9p29i6sU8WLmiW4FWY5tiwB9D6UBbcE", name: "EQ", emoji: "⛩️" },
  { address: "BCagckXeMChUKrHEd6fKFA1uiWDtcmCXMsqaheLiUPJd", name: "dvces", emoji: "🧱" },
  { address: "BCnqsPEtA1TkgednYEebRpkmwFRJDCjMQcKZMMtEdArc", name: "kreo", emoji: "🧴" },
  { address: "BrNoqdHUCcv9yTncnZeSjSov8kqhpmzv1nAiPbq1M95H", name: "PROFIT (QUANT)", emoji: "🐼" },
  { address: "CvNiezB8hofusHCKqu8irJ6t2FKY7VjzpSckofMzk5mB", name: "Dali", emoji: "🍀" },
  { address: "DKgvpfttzmJqZXdavDwTxwSVkajibjzJnN291Wce7M9Lb", name: "ROWDY", emoji: "⚽️" },
  { address: "DNfuF1L62WWyW3pNakVkyGGFzVVhj4Yr52jSmdTyeBHm", name: "GAKE", emoji: "🤑" },
  { address: "DpNVrtA3ERfKzX4F8Pi2CVykdJJjoNxyY5QgoytAwD26", name: "Gorrila", emoji: "🦍" },
  { address: "HEibUTHW7JHt7VgKYtWpQCSX7a6YHBmRQrixZs9i4wGY", name: "Enzo", emoji: "⚽️" },
  { address: "Hg5SEgwdHw8FUoKMPDZbREii3qEXwn6EvvsUdBPM2rmi", name: "threadguy", emoji: "😀" },
  { address: "HMMCa4urRGSub1Emotaz5dJbG2YdAD5eEYSAocnpmVmf", name: "YOGURT", emoji: "🪐" },
  { address: "HooderpigTVYapoXi6PQzxwtWhq3U1cuGvyu89fGjruY", name: "hooder", emoji: "😀" },
  { address: "HyYNVYmnFmi87NsQqWzLJhUTPBKQUfgfhdbBa554nMFF", name: "FARTCOIN DEV", emoji: "✈️" },
  { address: "AqDGmiveBXv7NMDm4UvVWxh9SYAFpGCzfEqV2iTdSBV8", name: "zflew", emoji: "🍔" },
  { address: "ASSw3FMwV99rh4CvxLAucTVHX8f4LQ2pmi2JjDA337sN", name: "Orangie", emoji: "😀" },
  { address: "B3wagQZiZU2hKa5pUCj6rrdhWsX3Q6WfTTnki9PjwzMh", name: "xander", emoji: "💚" },
  { address: "4sKEmneKj4tRyjBj7nLLtEMzPBoSVcBeQeLD5hH2wakN", name: "cented", emoji: "😀" },
  { address: "96qXevyn4wepZaZiehKUhr7NXCKMcKUKAKY4X3kjJcJZ", name: "Dali 2", emoji: "💚" },
  { address: "9nJ72hhtwyGHoUbEN3xfGuiLnrX3SnLYX52hkoahn2YH", name: "Lacy", emoji: "🍔" },
  { address: "9Wf2Gbo6ZnbJpXrwm1TTPpULHZz59uPZaszTsECE9PRb", name: "CLADZ", emoji: "🐶" },
  { address: "BiqkWhrJ4dfpE6TeNY34tA4GssG23SBH8CU8mqB7xZ6t", name: "Orangie", emoji: "🍊" },
  { address: "Cbj482ar1f5b7RvoEFJZEPCeZQ3SYEA5oxFYXmX4Wrio", name: "Roy", emoji: "🈺" },
  { address: "Cqhf5oUoBpK6WvkQQNcE1N2umkseR8o7LJDpb8ujvGrD", name: "binance whale", emoji: "💬" },
  { address: "DjpzbYPXReZzSPPgT4DntqdD9qxcrf4euMeb1dY7nqm6", name: "tekk", emoji: "🖖" },
  { address: "Eh9gqdQGux4dKqsx7hSF1mfLQuffVSyfhQtq3wNJ5pgK", name: "tavern", emoji: "🐢" },
  { address: "DFJZ7E2cAkUYf9jA91LVhnsQxJsWQHjs5itGjQffF8G9", name: "highsky", emoji: "😈" },
  { address: "dVs7zZksjFuq73xbtUC62brFXYYuxCuPSG4wZeGiHck", name: "aperal", emoji: "☢️" },
  { address: "4nwfXw7n98jEQn93VWY7Cuf1jnn1scHXuXCPGVYS9k6T", name: "4nwf", emoji: "🍇" },
  { address: "4Uq8kK9rzb1BhLKez5LgfzQLHUn2TTX1LRnyfkxFBrDo", name: "Ace YV", emoji: "🃏" },
  { address: "4vgDxDJubQxmHsaNxgsTESer9Qgk1bGKuE1dN4fXzsoj", name: "gnon 500k", emoji: "😀" },
  { address: "5VD46CMUb98ryVF5K5KSUraaVeZ1REmUPWLyaeknvXrC", name: "BLM", emoji: "✊️" },
  { address: "62FZUSWPMX9pofoV1uWHMdzFJRjwMa1LHgh2zhdEB7Zj", name: "blossom", emoji: "😀" },
  { address: "73KcgcTVyLYhnVX3PJbit8e4mC7jU8QotNGBFGix14jn", name: "dogeness 70k", emoji: "😀" },
  { address: "7nt58K2KF8HwBiCcRprCYP7civVifXP59fE4x229gAuv", name: "bloom (potion)", emoji: "⚠️" },
  { address: "7W7rw4hAEe9KNF8k7RYb9fQiCFb22GQGaZ6VL3DUawkQ", name: "crazy pnl", emoji: "😀" },
  { address: "BD7oWkEQsUwE8sj4UT7jtrGjHC8Gq1iRqXY7U6DTbJpf", name: "ghostee", emoji: "👻" },
  { address: "CBGpc64AAEEohJmihUQfg56BKzAp66QY5Hgv5Uj2tQ7c", name: "jlove", emoji: "🤓" },
  { address: "57JMxCescrFBvb8bqjNwHPM9J7wPF12SV5KJa82HCd9B", name: "milan", emoji: "💎" },
  { address: "5dzoivi2oG7Brpak98U2tZJZCwAhfLkiKdhQadW3Ef9P", name: "turtle new", emoji: "🐢" },
  { address: "2YyBULF7gFU42TaVhbCawoAfEWL325cf9qV8X3MgVABM", name: "Tahi", emoji: "😀" },
  { address: "3tc4BVAdzjr1JpeZu6NAjLHyp4kK3iic7TexMBYGJ4Xk", name: "dev gfnf", emoji: "😀" },
  { address: "41CMkTohu1nXSKNexVxWYK3Xwe8Zgox9ag4CBruFBBv7", name: "KILO", emoji: "🔺" },
  { address: "4GaqQnEeuP6XFcXVDZAvgEPQr14XKn7bomUhiygreiVm", name: "turtle new", emoji: "🐢" },
  { address: "6qBMtRQpQotxEgDRsUZ9DDnZoFxBf9MxxLPs4CG6yKrv", name: "forede", emoji: "🐔" },
  { address: "7iabBMwmSvS4CFPcjW2XYZY53bUCHzXjCFEFhxeYP4CY", name: "leens", emoji: "💀" },
  { address: "DSVc1Rd69sLcXBoZAsvkzK4jGFyJKP77K3J2CaFVNAFP", name: "pre", emoji: "🔒️" },
  { address: "FomZxk9FAk41wwoSJaDoKrrXjaXKXjfbUSoYHnnqn22D", name: "lester", emoji: "👻" },
  { address: "2fq1DpTUaWPNTJyN5h5DFAzp3vPvZhsjMg64Xz57VBSx", name: "ocrie dev", emoji: "😀" },
  { address: "2m6LWRL2S5zmqUPHLbDNPtJ1tauKSuKmhhiJo5WM84uu", name: "ALR TOP AL", emoji: "🌐" },
  { address: "2MDe4t6n29Fa9DkZMv2uZxdxbquDp4Jtros2oRQFfeU2", name: "stynx", emoji: "🌭" },
  { address: "2N7qg9a3N6DXgDBXvgZ5JGnXvxUnX1YhBEC5Y7waqxmi", name: "barron dev", emoji: "😀" },
  { address: "2YJbcB9G8wePrpVBcT31o8JEed6L3abgyCjt5qkJMymV", name: "alan", emoji: "😀" },
  { address: "33ejysPvHzoXPirP6dGRnA6FbK8QknRYPL8yJ7uzECgY", name: "llm dev cabal", emoji: "😀" },
  { address: "399uExRqpHy6aKRfcHV4DeD2RFrXAmY9hUV4rXbJWTZu", name: "tsotchke", emoji: "🐅" },
  { address: "3cQTRqJCiwBzbkVQc2CJqDoxKuhfzkxQEb8BFqdhYDJk", name: "UFD TOP WALLET", emoji: "✏️" },
  { address: "3j94xqKaKm4CgWVhmqBsEu8H4AV7nF2GYNNp433Q6oAH", name: "calm dev", emoji: "😀" },
  { address: "3kzHzrhi1w6pm4WQ9RD8Vu68YYyNkLuyFEpt8Hdky2oB", name: "sat 2 dev", emoji: "😀" },
  { address: "3T2AAHYRithTCJtxmn1Rf2AmcdYNhzTqhtEmUD2ukEpg", name: "dany wal", emoji: "😀" },
  { address: "3TfQqdKFWaikYYMRqvFRtMKsrYbse6ph3oSx9qE5rM7b", name: "zach dev", emoji: "😀" },
  { address: "3vJQXgVUFHranNgNBQGkjY1PQFkpPbxottdJCGvyNuXN", name: "peter pan", emoji: "😀" },
  { address: "4Bq5yvgoiZDsukGERb7aM52jDmbVPCpoihbztscZ5PeM", name: "JS Shocked", emoji: "⚡️" },
  { address: "4M8QVddY7Ld8eAaHoYcWKPxQcwxVuZsXMFKsm8921Uzd", name: "Kimchi", emoji: "🦐" },
  { address: "4qWKgdUQTfV771dxKp2HeBqEzTXEKW7agijrfDfpsXPC", name: "2 mil ai", emoji: "😀" },
  { address: "4Xj9PTw5JRrEaSo5xeFR1pEoW1AfJkZpoxtfYGQ1qWiS", name: "gerges", emoji: "💩" },
  { address: "5fWkLJfoDsRAaXhPJcJY19qNtDDQ5h6q1SPzsAPRrUNG", name: "g ai trader 2", emoji: "🤖" },
  { address: "5nDhGVcKEuRohGnH1tiQ5f4gVVatJUCL1kWyBKYjE8kn", name: "orcle maybe dev", emoji: "😀" },
  { address: "5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1", name: "Liquidity pool", emoji: "😀" },
  { address: "AGiyxRyapy84UbHzCdQKpCUeYjoPipDhVSuccKDVBXAb", name: "adam2", emoji: "🌴" },
  { address: "63aDDGuJQtbxqdfcWnboEPnY3ghRcrPTnz4p82HXaWzA", name: "sai dev", emoji: "😀" },
  { address: "64wmHEP7k9WN2gP2eMXzMspXU6cj1f16Yigf1MDkcFnH", name: "Lawn top trader", emoji: "😀" },
  { address: "68uK8vsbXai8zu9HuT151FmfqLFVH4Ta7fFTYShaQicA", name: "chad", emoji: "👻" },
  { address: "6ZhcVkV7Z7bEXT2QwjKUFFWST9grUGuitkn67g2iSR9v", name: "launch wal 1", emoji: "👻" },
  { address: "6zWjDbDtt23WL3BUVfF5UA3BeQM3i3chktFEBSJbZgAr", name: "ai cabal 1", emoji: "😀" },
  { address: "719sfKUjiMThumTt2u39VMGn612BZyCcwbM5Pe8SqFYz", name: "fash", emoji: "🎉" },
  { address: "72YiE4crBv2UhxRgRYKs4GaTGT2avbacfL4HNCfQLqsm", name: "kyzenil", emoji: "🧽" },
  { address: "7PhNwwBcKr4LU8kNTucEhew5dXdPrLfDFnQ4HkhPm1sm", name: "VINE", emoji: "🌿" },
  { address: "8XW7H31FqpZcnTgKCVHkrycAUuid9vSpfzKMgaQuGG6Y", name: "copy 1", emoji: "©️" },
  { address: "96sErVjEN7LNJ6Uvj63bdRWZxNuBngj56fnT9biHLKBf", name: "Orange", emoji: "🟠" },
  { address: "9ecRdqNCBxwReiY2pxtnLeayeBzE1CrSSmKKJJGdmsaJ", name: "lowkey", emoji: "🟣" },
  { address: "9gJcrJRo4ooC5N69ZL7aLsPUpQFtUwLCe7y2nD9FECsH", name: "mort", emoji: "🌏" },
  { address: "9yYya3F5EJoLnBNKW6z4bZvyQytMXzDcpU5D6yYr4jqL", name: "Loopier", emoji: "🪐" },
  { address: "AJ6MGExeK7FXmeKkKPmALjcdXVStXYokYNv9uVfDRtvo", name: "tim", emoji: "🧪" },
  { address: "AJmbna9ftuv9GtS8SAgBbJpWJpURrUJueLqwnCq2D8iC", name: "esse", emoji: "🐔" },
  { address: "AM84n1iLdxgVTAyENBcLdjXoyvjentTbu5Q6EpKV1PeG", name: "shaws wallet", emoji: "😀" },
  { address: "AnsazR3Rf7LK2P6dKmwdyr6bzknaw8WyaVKzh5s8LXqM", name: "good trader 4", emoji: "😀" },
  { address: "ApRnQN2HkbCn7W2WWiT2FEKvuKJp9LugRyAE1a9Hdz1", name: "s", emoji: "🐍" },
  { address: "ArfVe1K5gt5zsxzRCWSQeWc1rJSJjZzuuYxmvRh71mMQ", name: "uselesss dev", emoji: "👻" },
  { address: "ATFRUwvyMh61w2Ab6AZxUyxsAfiiuG1RqL6iv3Vi9q2B", name: "marcel", emoji: "😀" },
  { address: "ATmKENkRrL1JQQnoUNAQvkiwgjiHKUkzyncxTGxyzQL1", name: "4mil ai trader", emoji: "🦧" },
  { address: "Av3xWHJ5EsoLZag6pr7LKbrGgLRTaykXomDD5kBhL9YQ", name: "yolo", emoji: "📺" },
  { address: "AyCfEN3jjkta6hMQQJ6cKuHm1Z9BhuYHdm3WmDgvjqcs", name: "olg", emoji: "🐻" },
  { address: "batmo6N9m7mHww3MEdrN3aHzfaZuyF4wk1b2xoMpkYq", name: "omtad new", emoji: "🐹" },
  { address: "BEFo1bApSaFUKqhXq9Cc9M9We5evXkpH5zthVrBhSi7V", name: "Leck", emoji: "😀" },
  { address: "BHREKFkPQgAtDs8Vb1UfLkUpjG6ScidTjHaCWFuG2AtX", name: "risk", emoji: "🦄" },
  { address: "BtMBMPkoNbnLF9Xn552guQq528KKXcsNBNNBre3oaQtr", name: "letterbomb", emoji: "🥶" },
  { address: "BXNiM7pqt9Ld3b2Hc8iT3mA5bSwoe9CRrtkSUs15SLWN", name: "ABSOL", emoji: "👁️‍🗨️" },
  { address: "C2emJakQshEdS8WHZeKohmjPadx5DCnZkGjUknKXiV6g", name: "orcle maybe 2", emoji: "😀" },
  { address: "C5RS7Afq6qqvnYTCe2HZVQXLCvTPN3XRNbThPm7pdALi", name: "loopier side", emoji: "👻" },
  { address: "dATMod1UTXYzvaXji4mBsvXTeAUAC73TNJQAejKS54X", name: "omtad", emoji: "😀" },
  { address: "dAtmoUVjiihyMf6ah35wMVDmRgrVWusDWQaiKFXFsEV", name: "omtad", emoji: "🧸" },
  { address: "DfMxre4cKmvogbLrPigxmibVTTQDuzjdXojWzjCXXhzj", name: "Euris", emoji: "💰️" },
  { address: "DGPYpCdiVg2shab2TnNiZ2RnsjBQSmhgN71hJyWC5cYn", name: "maybe qwerty", emoji: "🐐" },
  { address: "DNWgp51tf7tGWgkq5SUdUmx4ym1wzJSrqKcwwaZPxqKH", name: "nothing", emoji: "⚡️" },
  { address: "DsXksKf2kiQ5jzrmchiwsDhvhBxDv1jgN291Wce7M9Lb", name: "sat 3", emoji: "😀" },
  { address: "ECCKBDWX3MkEcf3bULbLBb9FvrEQLsmPMFTKFpvjzqgP", name: "Kenzo", emoji: "🤿" },
  { address: "EcJWNtETrzdbj8s2dXpaE4Tu4r7fxALD6TNw9H8S6ksz", name: "nothing (shocked)", emoji: "😀" },
  { address: "EeLjBXRELqrcWAXbnj8T4jQPS9Qh7UGWiKxovsJ36pZY", name: "LLM DEV", emoji: "😀" },
  { address: "EGBFC7aDEK9HX19edd9DBTEX2ktoSNb9VJEVrCpmxp4t", name: "ver good ai", emoji: "❤️" },
  { address: "EgRiro8cJ3UprWHnSYqB7SMgtjVUZ5eh1zxpoPPxYLv5", name: "martin", emoji: "🦀" },
  { address: "FB14Z3tTTdzZ4PzQWB6owtUGwxWyQpgM3MNhJFiNtxTM", name: "ai cabal 2", emoji: "🤖" },
  { address: "FbvUU5qvD9JsU9jp3KDweCpZiVZHLoQBQ1PPCAAbd6FB", name: "profitier", emoji: "💲" },
  { address: "GANiebhnaTKg5DYTw9TKPcdP35KAtLryDJaTrN9fxnXZ", name: "sizzy", emoji: "🤵" },
  { address: "GCJBtREp8ptAeBVnLwGi6tEw6N3EATyKbhDD8Vrsh7xr", name: "ai cabal 5", emoji: "😀" },
  { address: "GfXQesPe3Zuwg8JhAt6Cg8euJDTVx751enp9EQQmhzPH", name: "spunosounds", emoji: "😀" },
  { address: "GH46NQCvp731BCk4AXRhubEfeZjNYBke4Rr19XZbH3xa", name: "indina rugger", emoji: "😀" },
  { address: "GiTjPLMYngDKZYxyc2MBFBwsS1Zt3NBCjJtAgsGb3AJv", name: "flame", emoji: "🧡" },
  { address: "GJA1HEbxGnqBhBifH9uQauzXSB53to5rhDrzmKxhSU65", name: "LAT", emoji: "🍇" },
  { address: "GTvBQnRvAPweU2qmYg8MDLND2PAAyYFKe35aKQGMRDaL", name: "polar", emoji: "🐯" },
  { address: "HBgHSCYxpopgwM962DzENtGJ1u5ugW5spaTHUbKhQJeK", name: "ai cabal dif", emoji: "🎇" },
  { address: "HdxkiXqeN6qpK2YbG51W23QSWj3Yygc1eEk2zwmKJExp", name: "bonk cabal", emoji: "👻" },
  { address: "HetnuaUUbBjFCx5wFYoiQuTRmDFKbEwqj1z4MsEJ1jYf", name: "euris side", emoji: "👻" },
  { address: "HhFwmpCG4VPaBbZwmYoDwHQhr4Q2advcRr6j3UZid2fG", name: "old seb", emoji: "👻" },
  { address: "HkFt55P3PhRWHXoTFeuvkKEE4ab26xZ1bk6UmXV88Pwz", name: "terp2", emoji: "🕳️" },
  { address: "HmBmSYwYEgEZuBUYuDs9xofyqBAkw4ywugB1d7R7sTGh", name: "Orangie new", emoji: "🍊" },
  { address: "HUzZ1MrEUXrdPJoAnn5B8uTcshwyyXxFW1EqY2dvcVhe", name: "giga chad holder", emoji: "🧔‍♂️" },
  { address: "HvM69Si84A5Jr6SQiyrJdYradKxPzmy1vD3uA1Trjnpn", name: "good ai 7", emoji: "👔" },
  { address: "HYasdkG25PJoC5WmYifKgei4vLLmq6o6isSEXkTsQV1C", name: "first day dev", emoji: "😀" },
  { address: "iWinRYGEWcaFFqWfgjh28jnqWL72XUMmUfhADpTQaRL", name: "scooter", emoji: "🍏" },
  { address: "J3b3GmLFCZDEU5Pbrw6umvVck2F7ZsS7HmFER1i1DJ37", name: "conviction trad", emoji: "😀" },
  { address: "kwhcooMFSt8k8S1RbdygHiYkAtyVVwcPMhyqBecTzBU", name: "carlos", emoji: "🐂" },
  { address: "qNGhUruCGJpXJdsnV74USHErcbm3CrXRsnP8D6Z34Hh", name: "dan 100x", emoji: "🐸" },
  { address: "TaPirMo4r8ijjikM98h1uazub7yMsX74AEH9Ga89cvt", name: "predo ai top wa", emoji: "🐯" },
  { address: "UUqGaqiahE9zo4R6Fh1Artk81ArNDeTAnhzcJsSpump", name: "Euris", emoji: "😀" },
  { address: "vHRSMB5mSEYJvwiW55fHquPsH67hhGYe4iGPcJchtor", name: "good ai", emoji: "😀" },
  { address: "z4tzCTkYhgjFw46Y5FU7dzM2hedYXfQygnQ4qZA13jj", name: "Jazzik wal", emoji: "🐸" },
  { address: "z5x9rTvd3SWatNVzzzMvN9bgMqfnWGixxYaUGHLn9YN", name: "able wal", emoji: "😀" },
  { address: "FpR5RsXauqdsGhgdW9C6zmBHMkcT9HJvXJQDhSUa4kYe", name: "wu", emoji: "😀" },
  { address: "FpSJaWysgd1vRS8bPEp2D6JC89RrT4owCmoBx781vvJp", name: "turtle", emoji: "🐢" },
  { address: "FXobn8QbTmzHeHu5GPWjDR31jh8HCW7TsqrczF8v7cKA", name: "Mungo", emoji: "🥭" },
  { address: "FXzJ6xwH2HfdKshERVAYiLh79PAUw9zC7ucngupt91ap", name: "dave side", emoji: "😀" },
  { address: "GfUc4a2FourP7KzS2ZBBK79fq2HTFHjKPXxbGPm2sWZS", name: "mungo 2", emoji: "🥭" },
  { address: "GrXjXop95XkVPYJafDJNCLFzK9K8LkpopxYcgUUn2H87", name: "grx", emoji: "👻" },
  { address: "HABhDh9zrzf8mA4SBo1yro8M6AirH2hZdLNPpuvMH6iA", name: "bugha", emoji: "😀" },
  { address: "JBKRd7yDg3npf5PDTrC4wGzLjS8tGPRMQ39k1AufvPkJ", name: "Wylie", emoji: "😀" },
  { address: "JDd3hy3gQn2V982mi1zqhNqUw1GfV2UL6g76STojCJPN", name: "rat", emoji: "😀" },
  { address: "js5Lja7zP5RCcTTpdNPB2SwRcUemBYJK8bZio4chzyw", name: "pnut whale", emoji: "💤" },
  { address: "kpmvoH1oB9ge46azx4S6ejpq5V9Ws4aP51jd4djURSi", name: "ADIN ROSS", emoji: "😀" },
  { address: "suqh5sHtr8HyJ7q8scBimULPkPpA557prMG47xCHQfK", name: "cupsey new", emoji: "🐐" },
  { address: "V6NRCpayijx2rCbUCDF16m7e4d4NjrPXJqUtV4Kakqa", name: "dali", emoji: "👻" },
  { address: "VyGNiGZ3PS3kHmnk5h3fkrcMBjLKFgX5acsnS4qaYKy", name: "JUICE", emoji: "🧃" },
  { address: "XDgpjPubjN5soLAFmAMjD2uVR1XZxUKgNpMU6Eo97H7", name: "cented", emoji: "🤪" },
  { address: "CyaE1VxvBrahnPWkqm5VsdCvyS2QmNht2UFrKJHga54o", name: "Cented", emoji: "🙉" },
  { address: "BTf4A2exGK9BCVDNzy65b9dUzXgMqB4weVkvTMFQsadd", name: "Kev", emoji: "🎩" },
  { address: "4DdrfiDHpmx55i4SPssxVzS9ZaKLb8qr45NKY9Er9nNh", name: "Mr Frog", emoji: "🐸" }
];

/**
 * Validation: Filter out wallets that don't meet minimum criteria
 */
export function getQualifiedWallets(
  minWinRate: number = 0,
  minPnL: number = 0,
  minTrades: number = 0
): KOLWallet[] {
  // Return all wallets since we're copy trading a curated list
  return KOL_WALLETS;
}

/**
 * Get all KOL wallet addresses
 */
export function getKOLAddresses(): string[] {
  return KOL_WALLETS.map(kol => kol.address);
}

/**
 * Get KOL info by address
 */
export function getKOLByAddress(address: string): KOLWallet | undefined {
  return KOL_WALLETS.find(kol => kol.address === address);
}

/**
 * Get KOL name by address (for logging)
 */
export function getKOLName(address: string): string {
  const kol = getKOLByAddress(address);
  return kol?.name || address.slice(0, 8) + '...';
}

/**
 * Check if an address is a tracked KOL
 */
export function isKOLWallet(address: string): boolean {
  return KOL_WALLETS.some(kol => kol.address === address);
}

/**
 * Get wallet stats
 */
export function getWalletStats() {
  return {
    totalWallets: KOL_WALLETS.length,
    qualifiedWallets: KOL_WALLETS.length
  };
}
