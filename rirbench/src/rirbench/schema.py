"""Versioned, machine-readable benchmark-result schema (Deliverable 3).

A submission is one JSON object validated against ``BenchmarkResult``. The same
shape is exported to JSON Schema at ``schema/result.schema.json`` (see
``rirbench.schema.export_json_schema``) and used by the GitHub Actions
submission validator.

Integrity: ``verification`` is set by **maintainer review**, never by passing
automated validation. ``self-reported`` is the only value a contributor may
submit; ``artifact-checked`` / ``independently-reproduced`` are assigned by a
maintainer after the documented checks. Passing CI does not imply endorsement.
"""
from __future__ import annotations

from enum import Enum
from typing import List, Optional

from pydantic import BaseModel, Field, field_validator

SCHEMA_VERSION = "1.0.0"


class Track(str, Enum):
    acoustic_validity = "A"          # Track A
    synthetic_to_real = "B"          # Track B
    downstream_asr = "C"             # Track C


class Verification(str, Enum):
    self_reported = "self-reported"
    artifact_checked = "artifact-checked"
    independently_reproduced = "independently-reproduced"


class MetricValue(BaseModel):
    name: str = Field(..., description="e.g. MAE_RT60_T20_s, WER, DRR_bias_dB")
    value: float
    unit: Optional[str] = Field(None, description="e.g. s, dB, ratio, percent")
    ci95_low: Optional[float] = None
    ci95_high: Optional[float] = None
    ci_method: Optional[str] = Field(None, description="e.g. bootstrap-1000-seed0")


class Environment(BaseModel):
    python: Optional[str] = None
    os: Optional[str] = None
    cpu: Optional[str] = None
    gpu: Optional[str] = None
    key_packages: Optional[dict] = Field(
        None, description="package->version, e.g. {'numpy':'1.26.4'}"
    )


class Contributor(BaseModel):
    # All attribution is voluntary; anonymous local runs never need this block.
    name: Optional[str] = None
    affiliation: Optional[str] = None
    contact: Optional[str] = None
    consent_to_publish: bool = Field(
        False, description="Must be true for a public submission to be listed."
    )


class BenchmarkResult(BaseModel):
    schema_version: str = Field(SCHEMA_VERSION)
    submission_id: str = Field(..., description="unique slug, e.g. teamX-2026-10-19")
    date: str = Field(..., description="ISO-8601 date, e.g. 2026-10-19")

    track: Track
    dataset: str = Field(..., description="HF repo id, e.g. mandipgoswami/rirmega")
    dataset_version: str = Field(..., description="e.g. main")
    benchmark_version: str = Field(..., description="rirbench version, e.g. 1.0.0")
    split: str = Field(..., description="e.g. test, unseen_room, unseen_distance")

    method: str = Field(..., description="model / method name")
    method_description: Optional[str] = None
    configuration: Optional[dict] = Field(None, description="hyperparameters / flags")

    sample_size: int = Field(..., ge=1)
    metrics: List[MetricValue] = Field(..., min_length=1)

    environment: Optional[Environment] = None
    reproduction_command: Optional[str] = Field(
        None, description="exact command another researcher can run"
    )
    code_url: Optional[str] = None
    artifact_url: Optional[str] = None

    contributor: Optional[Contributor] = None

    # Provenance / integrity — assigned by maintainer, not by CI.
    verification: Verification = Field(
        Verification.self_reported,
        description="self-reported | artifact-checked | independently-reproduced "
        "(maintainer-assigned; passing CI does not imply endorsement)",
    )
    notes: Optional[str] = None

    @field_validator("schema_version")
    @classmethod
    def _check_version(cls, v: str) -> str:
        if v != SCHEMA_VERSION:
            raise ValueError(f"schema_version must be {SCHEMA_VERSION}, got {v}")
        return v


def export_json_schema() -> dict:
    """Return the JSON Schema (draft 2020-12) for ``BenchmarkResult``."""
    return BenchmarkResult.model_json_schema()


def validate_dict(obj: dict) -> BenchmarkResult:
    """Validate a plain dict, raising pydantic.ValidationError on failure."""
    return BenchmarkResult.model_validate(obj)
