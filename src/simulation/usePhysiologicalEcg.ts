import { useMemo } from 'react'
import {
  generateValidatedEcg,
  sampleCardiacVector,
  type EcgStrip,
  type EcgValidationResult,
  type InstantaneousField,
  type SimulationParams,
} from '../simulation'

/**
 * Derive ECG strip + instantaneous field from physiology params.
 * Recomputes when params change — views only render the result.
 */
export function usePhysiologicalEcg(
  params: SimulationParams,
  elapsed_s: number,
): {
  strip: EcgStrip
  validation: EcgValidationResult
  field: InstantaneousField
} {
  const generated = useMemo(
    () => generateValidatedEcg(params, 0),
    [params],
  )

  const field = useMemo(
    () => sampleCardiacVector(elapsed_s, params),
    [elapsed_s, params],
  )

  return {
    strip: generated.strip,
    validation: generated.validation,
    field,
  }
}
