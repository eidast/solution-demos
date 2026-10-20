# Coin Toss × Jev

This local exercise asks Jev to predict the same future fair coin flip using its **three answer types**—Choice, Noul, and Score—in one provider request per toss. After validating all three answers, the server flips an independent software coin. The page shows every coin outcome, each prediction and signal, method bias, indecision, accuracy, mean Brier score, and the coin winner after 100 tosses. The [protocol and historical findings](EXPERIMENT.md) explain how to interpret each metric and why Score is only a diagnostic use for this categorical problem.

## Run it

1. Configure `OPENROUTER_API_KEY` or `AI_GATEWAY_API_KEY` in the ignored root `.env` file and restart the server. This exercise has no sample mode.
2. Run `./scripts/start-macos.command` or `npm start`, then open `/CoinToss/` on the local server.
3. Select **Start 100 tosses**. Requests are sequential. **Pause after this toss** stops after the current call; **Continue** resumes, and **One toss** advances once. A failed provider call stops the loop without flipping the coin so you can inspect and retry.
4. At 100 tosses, compare actual coin counts and the three method summaries. Select **New run** to repeat. A complete run uses 100 successful paid provider requests; each request contains three Jev questions. Failures or retries can add calls.

Each run is logged in `apps/jev/coin-toss/logs/<run-id>.jsonl`. Logs are local, ignored by Git, and retained until you delete them. Refreshing the browser loses the current run link; restarting the server loses its in-memory run while the log remains. The UI does not reload old runs. V1, v2, and v3 logs have different schemas and are documented separately in the [experiment protocol](EXPERIMENT.md).

**Interpretation:** Coin outcomes come from `crypto.randomInt(2)`, not Jev. The winner describes the coin outcomes. Accuracy and Brier describe how each earlier Jev answer compared with that independent result. No method can see a future random bit; a good result in one run is not proof of predictive skill.
