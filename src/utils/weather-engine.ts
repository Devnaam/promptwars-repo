/**
 * Weather Severity Engine
 * Maps current weather parameters to actionable transit risk recommendations
 * covering all three phases of a severe weather event: Before, During, and After.
 */

/** Severity levels for weather conditions. */
export type WeatherSeverity = 'low' | 'moderate' | 'high' | 'critical';

/** The three phases of a severe weather event. */
export type WeatherPhase = 'before' | 'during' | 'after';

/** Structured travel advisory output. */
export interface TravelAdvisoryResult {
  readonly riskLevel: WeatherSeverity;
  readonly phase: WeatherPhase;
  readonly recommendation: string;
  readonly transitMode: ReadonlyArray<{
    readonly mode: string;
    readonly safe: boolean;
    readonly advisory: string;
  }>;
}

/** Weather parameters used for severity calculation. */
export interface WeatherParameters {
  readonly rainfallMm: number;
  readonly windSpeedKmh: number;
  readonly visibilityKm: number;
  readonly floodRiskPercent: number;
}

/**
 * Calculates the overall weather severity from raw weather parameters.
 * Uses a weighted scoring system across rainfall, wind, visibility, and flood risk.
 *
 * @param params - The raw weather parameters
 * @returns The calculated severity level
 */
export function calculateSeverity(params: WeatherParameters): WeatherSeverity {
  let score = 0;

  // Rainfall scoring (0-40 points)
  if (params.rainfallMm > 200) score += 40;
  else if (params.rainfallMm > 100) score += 30;
  else if (params.rainfallMm > 50) score += 20;
  else if (params.rainfallMm > 20) score += 10;

  // Wind speed scoring (0-25 points)
  if (params.windSpeedKmh > 100) score += 25;
  else if (params.windSpeedKmh > 60) score += 18;
  else if (params.windSpeedKmh > 40) score += 10;

  // Visibility scoring (0-15 points)
  if (params.visibilityKm < 0.5) score += 15;
  else if (params.visibilityKm < 2) score += 10;
  else if (params.visibilityKm < 5) score += 5;

  // Flood risk scoring (0-20 points)
  if (params.floodRiskPercent > 80) score += 20;
  else if (params.floodRiskPercent > 50) score += 14;
  else if (params.floodRiskPercent > 25) score += 7;

  if (score >= 70) return 'critical';
  if (score >= 45) return 'high';
  if (score >= 20) return 'moderate';
  return 'low';
}

/**
 * Generates a complete travel advisory based on current weather severity and phase.
 * Provides mode-specific guidance for walking, driving, and public transit.
 *
 * @param severity - The calculated weather severity
 * @param phase - The current phase of the weather event
 * @returns A structured travel advisory with per-mode risk assessments
 */
export function generateTravelAdvisory(
  severity: WeatherSeverity,
  phase: WeatherPhase
): TravelAdvisoryResult {
  const advisoryMap: Record<WeatherPhase, Record<WeatherSeverity, Omit<TravelAdvisoryResult, 'riskLevel' | 'phase'>>> = {
    before: {
      low: {
        recommendation: 'Travel is generally safe. Monitor weather updates and carry rain gear.',
        transitMode: [
          { mode: 'Walking', safe: true, advisory: 'Carry an umbrella and wear waterproof footwear.' },
          { mode: 'Driving', safe: true, advisory: 'Check tire treads and ensure wipers are functional.' },
          { mode: 'Public Transit', safe: true, advisory: 'Minor delays possible. Check schedules before departure.' },
        ],
      },
      moderate: {
        recommendation: 'Complete essential travel early. Stock emergency supplies and secure outdoor items.',
        transitMode: [
          { mode: 'Walking', safe: true, advisory: 'Limit walks to essential trips. Avoid low-lying areas.' },
          { mode: 'Driving', safe: true, advisory: 'Fill fuel tanks and avoid routes prone to waterlogging.' },
          { mode: 'Public Transit', safe: true, advisory: 'Expect service disruptions. Travel before peak rainfall.' },
        ],
      },
      high: {
        recommendation: 'Avoid non-essential travel. Complete all preparations and stay near shelter.',
        transitMode: [
          { mode: 'Walking', safe: false, advisory: 'Avoid walking. Flash floods may begin without warning.' },
          { mode: 'Driving', safe: false, advisory: 'Do not drive unless evacuating. Roads may flood rapidly.' },
          { mode: 'Public Transit', safe: false, advisory: 'Services likely suspended. Do not wait at exposed stops.' },
        ],
      },
      critical: {
        recommendation: 'SHELTER IMMEDIATELY. Do not travel under any circumstances.',
        transitMode: [
          { mode: 'Walking', safe: false, advisory: 'Extremely dangerous. Stay indoors at all costs.' },
          { mode: 'Driving', safe: false, advisory: 'Vehicles can be swept away in as little as 30cm of moving water.' },
          { mode: 'Public Transit', safe: false, advisory: 'All services suspended. Emergency shelters may be activated.' },
        ],
      },
    },
    during: {
      low: {
        recommendation: 'Light monsoon activity. Proceed with caution and stay updated.',
        transitMode: [
          { mode: 'Walking', safe: true, advisory: 'Stay on elevated sidewalks. Watch for slippery surfaces.' },
          { mode: 'Driving', safe: true, advisory: 'Reduce speed. Maintain safe following distance.' },
          { mode: 'Public Transit', safe: true, advisory: 'Minor delays. Have alternative routes planned.' },
        ],
      },
      moderate: {
        recommendation: 'Active monsoon. Only essential travel recommended.',
        transitMode: [
          { mode: 'Walking', safe: false, advisory: 'Waterlogging likely. Risk of open manholes and debris.' },
          { mode: 'Driving', safe: false, advisory: 'Severe waterlogging. Risk of engine stalling and aquaplaning.' },
          { mode: 'Public Transit', safe: false, advisory: 'Significant disruptions. Trains and buses may be halted.' },
        ],
      },
      high: {
        recommendation: 'Severe conditions. Shelter in place. Do NOT attempt travel.',
        transitMode: [
          { mode: 'Walking', safe: false, advisory: 'Life-threatening. Fast-moving water and debris risk.' },
          { mode: 'Driving', safe: false, advisory: 'Roads impassable. Vehicles being abandoned.' },
          { mode: 'Public Transit', safe: false, advisory: 'All services suspended indefinitely.' },
        ],
      },
      critical: {
        recommendation: 'EXTREME EMERGENCY. Move to highest available floor. Await rescue if stranded.',
        transitMode: [
          { mode: 'Walking', safe: false, advisory: 'FATAL RISK. Do not exit shelter for any reason.' },
          { mode: 'Driving', safe: false, advisory: 'Impossible. Roads submerged. Emergency vehicles only.' },
          { mode: 'Public Transit', safe: false, advisory: 'Infrastructure may be damaged. Await official all-clear.' },
        ],
      },
    },
    after: {
      low: {
        recommendation: 'Conditions improving. Resume normal activities with awareness.',
        transitMode: [
          { mode: 'Walking', safe: true, advisory: 'Watch for residual puddles and slippery surfaces.' },
          { mode: 'Driving', safe: true, advisory: 'Check for road damage and fallen debris before driving.' },
          { mode: 'Public Transit', safe: true, advisory: 'Services resuming. Check for schedule changes.' },
        ],
      },
      moderate: {
        recommendation: 'Water receding. Travel cautiously. Report hazards to local authorities.',
        transitMode: [
          { mode: 'Walking', safe: true, advisory: 'Avoid stagnant water — risk of waterborne diseases and hidden hazards.' },
          { mode: 'Driving', safe: true, advisory: 'Drive slowly. Watch for potholes, sinkholes, and weakened bridges.' },
          { mode: 'Public Transit', safe: true, advisory: 'Limited services. Expect overcrowding on operational routes.' },
        ],
      },
      high: {
        recommendation: 'Significant damage expected. Only travel if necessary for relief or evacuation.',
        transitMode: [
          { mode: 'Walking', safe: false, advisory: 'Structural collapse risk. Downed power lines possible.' },
          { mode: 'Driving', safe: false, advisory: 'Many roads damaged or blocked. Follow official detours only.' },
          { mode: 'Public Transit', safe: false, advisory: 'Partial restoration. Priority given to emergency services.' },
        ],
      },
      critical: {
        recommendation: 'Major disaster zone. Travel only under official evacuation orders.',
        transitMode: [
          { mode: 'Walking', safe: false, advisory: 'Extreme hazards. Await rescue teams if displaced.' },
          { mode: 'Driving', safe: false, advisory: 'Infrastructure destroyed. Emergency vehicles and relief convoys only.' },
          { mode: 'Public Transit', safe: false, advisory: 'Fully suspended. Emergency airlift or boat rescue may be required.' },
        ],
      },
    },
  };

  const advisory = advisoryMap[phase][severity];
  return {
    riskLevel: severity,
    phase,
    ...advisory,
  };
}
