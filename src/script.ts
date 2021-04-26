interface onLocationServices {
    serviceName?: string,
    hours?: string,
    days?: string,
    fees?: number
}

function createOnLocationService(config: onLocationServices): { serviceName: string; hours: string; days: string; fees: number } {
    let newOnLocationService = { serviceName: "DefaultName", hours: "Not Scheduled", days: "Not Scheduled", fees: 0 };
    if (config.serviceName) {
        newOnLocationService.serviceName = config.serviceName;
    }
    if (config.hours) {
        newOnLocationService.hours = config.hours;
    }
    if (config.days) {
        newOnLocationService.days = config.days;
    }
    if (config.fees) {
        newOnLocationService.fees = config.fees;
    }
    return newOnLocationService;
}

let onLocationServicesList: onLocationServices[] = [];

let spanishclass = createOnLocationService({serviceName: "Spanish", hours: "6:00PM - 7:00PM", days: "Wednesdays", fees: 0});
onLocationServicesList.push(spanishclass);
console.log(onLocationServicesList);