# rirbench

Independent benchmark & evaluation suite for the RIR-Mega room-impulse-response
ecosystem. Dependency-light, host-safe (single-threaded BLAS, closed-form slope),
fully seeded.

## Install

```bash
pip install -e ".[dev]"      # core + test deps
pip install -e ".[hub]"      # + Hugging Face data access
pip install -e ".[asr]"      # + jiwer for Track C WER/CER
```

## CLI

```bash
rirbench metrics FILE.wav                 # RT60(T20/T30), EDT, DRR, C50, C80, D50
rirbench track-a --smoke                  # acoustic validity (fixtures)
rirbench track-a --dir WAVS --meta M.parquet --out r.json   # agreement vs. metadata
rirbench track-b --smoke                  # synthetic→real protocol
rirbench track-c --smoke                  # downstream ASR WER/CER path
rirbench schema --out result.schema.json  # export the result JSON Schema
rirbench validate submission.json         # validate a submission
```

## Metrics (reference implementations)

All computed directly from the RIR waveform via Schroeder backward integration
with documented fit windows (T20 = [-5,-25] dB, T30 = [-5,-35] dB, EDT = [0,-10] dB,
extrapolated to 60 dB). DRR uses a ±2.5 ms direct window around the onset peak;
C50/C80/D50 use 50/80 ms early windows. Onset = first sample 20 dB below the global
peak. These are honest floors — a careful DSP pipeline or trained model should
refine them.

## Tests

```bash
python fixtures/make_fixtures.py   # 3 synthetic RIRs with known reverberation
pytest -q                          # unit + smoke (14 tests)
```

## License

Apache-2.0. The RIR-Mega datasets retain their own CC-BY-NC-4.0 license.
