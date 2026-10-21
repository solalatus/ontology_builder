classes:
  Building:
    meaning: "A building contains floors and includes controlled zones."
  Floor:
    meaning: "A floor is part of a building and contains spaces."
    aliases:
      - storey
  Space:
    meaning: "A space is an individual area that can have a serving terminal unit or an associated occupancy sensor."
  Zone:
    meaning: "A zone is an area controlled together whose occupancy status may be reported."
    properties:
      occupancyStatus:
        type: text
        allowed:
          - occupied
          - unoccupied
          - unknown
  Thermostat:
    meaning: "A thermostat serves a zone as its controlling device and has a temperature sensor and setpoint as points."
    properties:
      status:
        type: text
        allowed:
          - normal
          - fault
          - offline
      mode:
        type: text
        allowed:
          - heating
          - cooling
          - auto
          - off
  TemperatureSensor:
    meaning: "A temperature sensor reports a temperature value in degrees Celsius and can be a thermostat point."
    properties:
      temperatureValue:
        type: number
  AirTemperatureSensor:
    meaning: "An air temperature sensor is a more specific temperature sensor that reports an AHU air reading in degrees Celsius."
    properties:
      temperatureValue:
        type: number
  WaterTemperatureSensor:
    meaning: "A water temperature sensor reports a water reading in degrees Celsius when the particular sensor is identified independently."
    properties:
      temperatureValue:
        type: number
  TemperatureSetpoint:
    meaning: "A temperature setpoint is a target associated with a thermostat and has a value in degrees Celsius."
    properties:
      setpointValue:
        type: number
  AirTemperatureSetpoint:
    meaning: "An air temperature setpoint is an AHU air target with a value in degrees Celsius."
    properties:
      setpointValue:
        type: number
  CoolingTemperatureSetpoint:
    meaning: "A cooling temperature setpoint is an AHU cooling target with a value in degrees Celsius."
    properties:
      setpointValue:
        type: number
  HeatingTemperatureSetpoint:
    meaning: "A heating temperature setpoint is an AHU heating target with a value in degrees Celsius."
    properties:
      setpointValue:
        type: number
  TemperatureDeadbandSetpoint:
    meaning: "A temperature deadband setpoint specifies the size of an allowed band around an active setpoint in degrees Celsius, not another target temperature."
    properties:
      deadbandValue:
        type: number
  OccupancySensor:
    meaning: "An occupancy sensor is a point associated with a space or zone that reports occupancy."
    properties:
      occupiedReading:
        type: text
        allowed:
          - occupied
          - unoccupied
          - unknown
  TerminalUnit:
    meaning: "A terminal unit serves a space's conditioning needs and can be fed by an air handling unit."
    properties:
      status:
        type: text
        allowed:
          - off
          - on
          - alarm
  AirHandlingUnit:
    meaning: "An air handling unit feeds terminal units or air plenums and has components and control points."
    aliases:
      - AHU
      - air handler unit
    properties:
      status:
        type: text
        allowed:
          - off
          - on
          - alarm
  AirPlenum:
    meaning: "An air plenum can be fed by an air handling unit and has a reported airflow role."
    properties:
      airflowState:
        type: text
        allowed:
          - supply
          - return
          - exhaust
  Fan:
    meaning: "A fan is an air handling unit component with an operating status."
    properties:
      status:
        type: text
        allowed:
          - off
          - on
          - alarm
  Filter:
    meaning: "A filter is an air handling unit component with a condition status."
    properties:
      status:
        type: text
        allowed:
          - clean
          - dirty
          - replacement due
  Damper:
    meaning: "A damper is an air handling unit component that reports its position as a percentage."
    properties:
      position:
        type: number
  CoolingValve:
    meaning: "A cooling valve is an air handling unit component fed by a chiller that reports its position as a percentage."
    properties:
      position:
        type: number
  HeatingValve:
    meaning: "A heating valve is an air handling unit component fed by a boiler that reports its position as a percentage."
    properties:
      position:
        type: number
  Chiller:
    meaning: "A chiller feeds a cooling valve and reports its operating status."
    properties:
      status:
        type: text
        allowed:
          - off
          - on
          - alarm
  Boiler:
    meaning: "A boiler feeds a heating valve and reports its operating status."
    properties:
      status:
        type: text
        allowed:
          - off
          - on
          - alarm
  Pump:
    meaning: "A pump reports its operating status but must be identified independently before it can be checked."
    properties:
      status:
        type: text
        allowed:
          - off
          - on
          - alarm
  Economizer:
    meaning: "An economizer is part of an air handling unit and reports whether it is disabled, enabled, or active."
    properties:
      status:
        type: text
        allowed:
          - disabled
          - enabled
          - active
  CO2Sensor:
    meaning: "A CO2 sensor reports a value in parts per million even when its air-stream role is not established."
    properties:
      value:
        type: number
  OutsideAirCO2Sensor:
    meaning: "An outside-air CO2 sensor is a CO2 sensor identified as measuring outside air in parts per million."
    properties:
      value:
        type: number
  ReturnAirCO2Sensor:
    meaning: "A return-air CO2 sensor is a CO2 sensor identified as measuring return air in parts per million."
    properties:
      value:
        type: number
  CO2DifferentialSensor:
    meaning: "A CO2 differential sensor directly reports a difference in parts per million rather than an individual air-stream reading."
    properties:
      value:
        type: number

relationships:
  - name: hasAsPart
    from: Building
    to: Floor
    meaning: "The building has the floor as a part."
  - name: hasAsPart
    from: Floor
    to: Space
    meaning: "The floor has the space as a part."
  - name: includes
    from: Building
    to: Zone
    meaning: "The building includes the controlled zone."
  - name: serves
    from: Thermostat
    to: Zone
    meaning: "The thermostat serves the zone as its controlling device."
    aliases:
      - controls the zone
  - name: isPhysicallyLocatedIn
    from: Thermostat
    to: Space
    meaning: "The thermostat is physically located in the space when that location is recorded."
  - name: hasAsPoint
    from: Thermostat
    to: TemperatureSensor
    meaning: "The thermostat has the temperature sensor as a point used for control."
  - name: hasAsPoint
    from: Thermostat
    to: TemperatureSetpoint
    meaning: "The thermostat has the temperature setpoint as a point used to maintain the desired temperature."
  - name: hasAsPoint
    from: Space
    to: OccupancySensor
    meaning: "The space has the occupancy sensor as a point for detecting occupancy, which does not establish where it is installed."
  - name: hasAsPoint
    from: Zone
    to: OccupancySensor
    meaning: "The zone has the occupancy sensor as a point relevant to its control."
  - name: serves
    from: TerminalUnit
    to: Space
    meaning: "The terminal unit serves the space's conditioning needs, which does not establish its installation space."
  - name: feeds
    from: AirHandlingUnit
    to: TerminalUnit
    meaning: "The air handling unit feeds the terminal unit."
  - name: feeds
    from: AirHandlingUnit
    to: AirPlenum
    meaning: "The air handling unit feeds the air plenum without establishing a path from that plenum to a terminal unit."
  - name: hasAsPart
    from: AirHandlingUnit
    to: Fan
    meaning: "The air handling unit has the fan as a part."
  - name: hasAsPart
    from: AirHandlingUnit
    to: Filter
    meaning: "The air handling unit has the filter as a part."
  - name: hasAsPart
    from: AirHandlingUnit
    to: Damper
    meaning: "The air handling unit has the damper as a part."
  - name: hasAsPart
    from: AirHandlingUnit
    to: CoolingValve
    meaning: "The air handling unit has the cooling valve as a part."
  - name: hasAsPart
    from: AirHandlingUnit
    to: HeatingValve
    meaning: "The air handling unit has the heating valve as a part."
  - name: feeds
    from: Chiller
    to: CoolingValve
    meaning: "The chiller feeds the cooling valve on the chilled-water path."
  - name: feeds
    from: Boiler
    to: HeatingValve
    meaning: "The boiler feeds the heating valve on the hot-water path."
  - name: hasAsPoint
    from: AirHandlingUnit
    to: AirTemperatureSensor
    meaning: "The air handling unit has the air temperature sensor as a point."
  - name: hasAsPoint
    from: AirHandlingUnit
    to: AirTemperatureSetpoint
    meaning: "The air handling unit has the air temperature setpoint as a point."
  - name: hasAsPoint
    from: AirHandlingUnit
    to: CoolingTemperatureSetpoint
    meaning: "The air handling unit has the cooling temperature setpoint as a point."
  - name: hasAsPoint
    from: AirHandlingUnit
    to: HeatingTemperatureSetpoint
    meaning: "The air handling unit has the heating temperature setpoint as a point."
  - name: hasAsPoint
    from: AirHandlingUnit
    to: TemperatureDeadbandSetpoint
    meaning: "The air handling unit has the temperature deadband setpoint as a point."
  - name: hasAsPoint
    from: AirHandlingUnit
    to: CO2Sensor
    meaning: "The air handling unit has a CO2 sensor as a point when its air-stream role has not been established."
  - name: hasAsPoint
    from: AirHandlingUnit
    to: OutsideAirCO2Sensor
    meaning: "The air handling unit has the identified outside-air CO2 sensor as a point."
  - name: hasAsPoint
    from: AirHandlingUnit
    to: ReturnAirCO2Sensor
    meaning: "The air handling unit has the identified return-air CO2 sensor as a point."
  - name: hasAsPart
    from: AirHandlingUnit
    to: Economizer
    meaning: "The air handling unit has the economizer as a part."
  - name: hasItsLocationIn
    from: AirHandlingUnit
    to: Building
    meaning: "The air handling unit has its recorded physical location in the building, which does not identify its floor or the area it serves."
  - name: hasItsLocationOn
    from: AirHandlingUnit
    to: Floor
    meaning: "The air handling unit has its recorded physical location on the floor, which does not mean it serves that floor."
  - name: isAssociatedWithInstallation
    from: OutsideAirCO2Sensor
    to: Building
    meaning: "The outside-air CO2 sensor is associated with that building's installation without specifying where it is mounted."
  - name: isAMoreSpecificKindOf
    from: AirTemperatureSensor
    to: TemperatureSensor
    meaning: "An air temperature sensor is a more specific kind of temperature sensor, not a duplicate physical point."
  - name: isAMoreSpecificKindOf
    from: OutsideAirCO2Sensor
    to: CO2Sensor
    meaning: "An identified outside-air CO2 sensor is the same physical CO2 sensor described by its established air-stream role."
  - name: isAMoreSpecificKindOf
    from: ReturnAirCO2Sensor
    to: CO2Sensor
    meaning: "An identified return-air CO2 sensor is the same physical CO2 sensor described by its established air-stream role."

rules:
  - name: establishThermostatControlContext
    conditions:
      - "Both the temperature sensor and temperature setpoint must be associated with the thermostat to establish its control context."
      - "Their values must be trustworthy before comparing the thermostat's reading with its target."
  - name: establishOccupiedArea
    conditions:
      - "A trustworthy occupied zone status establishes occupancy for a zone."
      - "An occupied reading from an occupancy sensor established as a point of that zone can also support the zone check."
      - "Unknown or unreliable occupancy does not establish an occupied zone, and a sensor associated only with a space does not establish occupancy for an otherwise unmapped zone."
  - name: increaseCoolingWhenAboveTarget
    conditions:
      - "Establish a trustworthy AHU air-temperature reading and the trustworthy cooling temperature setpoint applicable to that reading and response."
      - "The measured air temperature is above that cooling setpoint; finding both points on the same AHU does not establish the match."
  - name: increaseHeatingWhenBelowTarget
    conditions:
      - "Establish a trustworthy AHU air-temperature reading and the trustworthy heating temperature setpoint applicable to that reading and response."
      - "The measured air temperature is below that heating setpoint; finding both points on the same AHU does not establish the match."
  - name: holdSteadyWithinDeadband
    conditions:
      - "Establish the applicable AHU air-temperature reading and which AHU air-temperature, cooling, or heating setpoint is active for it."
      - "Establish the configured deadband and the control's definition of its boundaries around that active setpoint."
      - "The reading is within those boundaries; the deadband value alone does not define them."
  - name: establishEconomizerSuitability
    conditions:
      - "Independently establish the economizer's actual sensed conditions and control intent for the particular AHU."
      - "Those conditions support using the economizer to reduce mechanical conditioning."
      - "Without that information, leave the decision unresolved; CO2 readings or an enabled status do not establish suitability."
  - name: doNotInferUnrecordedPaths
    conditions:
      - "Do not infer which spaces a zone covers from its thermostat's location or the floor layout."
      - "Do not infer plenum-to-terminal-unit flow from their separate AHU feed connections."
      - "An independently identified pump, water temperature sensor, or CO2 differential sensor has no established connection to a particular plant path or AHU."
  - name: interpretDiagnosticReadings
    conditions:
      - "A damper or valve position reports where it is, not whether it followed a command; judging its response requires independently established control intent."
      - "A plant equipment status does not establish circulation on a specific pump path or delivered water temperature."
      - "A water reading needs an established measured path and operating target before judging delivery temperature."
      - "Outside-air and return-air CO2 readings support a ventilation comparison when both are trustworthy, not an economizer decision."
  - name: keepUnverifiedChecksUnverified
    conditions:
      - "A missing or unreliable value leaves the specific check or response it supports unresolved rather than blocking every other response."
      - "An economizer's active status confirms operation; enabled alone confirms only availability."
      - "An AHU-fed plenum without a trustworthy supply airflow state is not a confirmed supply-air path."

actions:
  - name: checkConditioningInOccupiedZone
    input: Zone
    preconditions:
      - "Establish that the area being checked is occupied."
      - "Identify its serving thermostat; check a terminal unit only if the affected space and its serving unit are independently identified."
    effect: "Make no equipment change; check whether serving control is available for occupied conditions."
    verification: "Report a serving thermostat as operating when its status is normal, and report the identified terminal unit's supported operating indication separately; leave unavailable indications or an unresolved terminal-unit path unverified."
  - name: increaseCooling
    input: AirHandlingUnit
    preconditions:
      - "A trustworthy applicable measured air temperature is above its matched, trustworthy cooling temperature setpoint."
    effect: "Command the cooling path to bring air temperature down toward the setpoint, without assuming a setpoint change or particular valve movement."
    verification: "Check that the applicable air-temperature reading trends downward toward the cooling setpoint; if that reading is unavailable, leave the result unverified."
  - name: increaseHeating
    input: AirHandlingUnit
    preconditions:
      - "A trustworthy applicable measured air temperature is below its matched, trustworthy heating temperature setpoint."
    effect: "Command the heating path to raise air temperature toward the setpoint, without assuming a setpoint change or particular valve movement."
    verification: "Check that the applicable air-temperature reading trends upward toward the heating setpoint; if that reading is unavailable, leave the result unverified."
  - name: useEconomizer
    input: AirHandlingUnit
    preconditions:
      - "Independently established sensed conditions and control intent support economizer use to reduce mechanical conditioning."
    effect: "Request economizer operation on the AHU to reduce mechanical cooling."
    verification: "Confirm the economizer reports active; enabled alone does not verify operation, and an unavailable status leaves verification unresolved."
  - name: holdSteadyWithinDeadband
    input: AirHandlingUnit
    preconditions:
      - "The applicable air-temperature reading, active AHU setpoint, and control-defined deadband boundaries are established."
      - "The reading is within those boundaries."
    effect: "Deliberately make no heating or cooling change."
    verification: "Keep checking that the applicable air-temperature reading remains within the established boundaries; otherwise leave the hold-steady result unverified."