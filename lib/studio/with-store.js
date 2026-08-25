const { hydrateStudioStore, persistStudioStore } = require("./store");

// En mode fichiers (local), hydrate/persist ne font rien : comportement
// identique à avant. En mode supabase, on charge les collections au début de
// la requête, puis on retient la réponse (res.end est mis en attente) jusqu'à
// ce que les collections modifiées soient écrites — sinon le client pourrait
// relire avant que l'écriture distante n'atterrisse, et un « succès » pourrait
// partir alors que la persistance a échoué.
function withStudioStore(handler) {
  return async function (req, res) {
    try {
      await hydrateStudioStore();
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error("[studio] hydratation stockage :", message);
      res.statusCode = 503;
      res.setHeader("Content-Type", "application/json; charset=utf-8");
      return res.end(JSON.stringify({ error: "Stockage studio indisponible" }));
    }

    const realEnd = res.end.bind(res);
    let pendingEnd = null;
    res.end = function () {
      pendingEnd = Array.prototype.slice.call(arguments);
      return res;
    };

    let handlerError = null;
    try {
      await handler(req, res);
    } catch (err) {
      handlerError = err;
    }

    let persistError = null;
    try {
      await persistStudioStore();
    } catch (err) {
      persistError = err;
      const message = err instanceof Error ? err.message : String(err);
      console.error("[studio] persistance stockage :", message);
    }

    res.end = realEnd;
    if (handlerError) throw handlerError;

    if (persistError && res.statusCode < 400) {
      res.statusCode = 500;
      res.setHeader("Content-Type", "application/json; charset=utf-8");
      return realEnd(
        JSON.stringify({ error: "Écriture du stockage studio impossible" })
      );
    }

    if (pendingEnd) {
      return realEnd.apply(null, pendingEnd);
    }
  };
}

module.exports = { withStudioStore };
