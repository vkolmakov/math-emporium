import { events } from "../../../server/aux";
import ScheduledAppointmentsController from "../../../server/scheduledAppointments/scheduledAppointments.controller";

describe("ScheduledAppointmentsController", () => {
    const LOCATION = {
        calendarId: "fluffy-doggy-2",
    };

    let scheduledAppointmentsController;

    let mockCacheService;
    let mockDateTime;

    let mockCreateLogger;
    let mockDeleteLogger;
    let mockCreateEventLogger;
    let mockHelper;

    let mockRequest;
    let mockResponse;
    let mockNext;

    beforeEach(() => {
        mockCacheService = {
            calendarEvents: {
                invalidate: jest.fn(),
            },
        };

        mockDateTime = {
            now: jest.fn(),
            parse: jest.fn(),
        };

        mockCreateLogger = jest.fn();
        mockDeleteLogger = jest.fn();
        mockCreateEventLogger = jest.fn().mockImplementation((eventName) => {
            let logger;
            switch (eventName) {
                case events.USER_CREATED_APPOINTMENT: {
                    logger = mockCreateLogger;
                    break;
                }
                case events.USER_REMOVED_APPOINTMENT: {
                    logger = mockDeleteLogger;
                    break;
                }
                default: {
                    logger = jest.fn();
                }
            }
            return logger;
        });

        mockHelper = {
            canCreateAppointment: jest.fn(),
            createAppointment: jest.fn(),
            sendAppointmentCreationConfirmation: jest.fn(),
            gatherCompleteAppointmentData: jest
                .fn()
                .mockReturnValue(Promise.resolve({ location: LOCATION })),
            getActiveAppointmentsForUserAtLocation: jest.fn(),
        };

        mockRequest = {
            user: {
                id: 1,
                setDefaultAppointmentPreferencesIfNoneSet: jest.fn(),
            },
            body: {},
        };

        mockResponse = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis(),
        };

        mockNext = jest.fn();

        scheduledAppointmentsController = new ScheduledAppointmentsController(
            mockCacheService,
            mockDateTime,
            mockCreateEventLogger,
            mockHelper,
        );
    });

    const expectNoErrorCaught = (nextFunction) =>
        expect(nextFunction).not.toHaveBeenCalled();

    describe("create", () => {
        describe("if scheduling appointment is possible", () => {
            beforeEach(() => {
                mockHelper.canCreateAppointment.mockReturnValue({
                    canCreateAppointment: true,
                    reason: "",
                });
                mockHelper.createAppointment.mockReturnValue(Promise.resolve());
            });

            it("schedules an appointment", (done) => {
                scheduledAppointmentsController
                    .create(mockRequest, mockResponse, mockNext)
                    .then(() => {
                        expectNoErrorCaught(mockNext);
                        expect(
                            mockHelper.canCreateAppointment,
                        ).toHaveBeenCalled();
                        done();
                    });
            });

            it("invalidates calendar cache", (done) => {
                scheduledAppointmentsController
                    .create(mockRequest, mockResponse, mockNext)
                    .then(() => {
                        expectNoErrorCaught(mockNext);
                        expect(
                            mockCacheService.calendarEvents.invalidate,
                        ).toHaveBeenCalledWith(LOCATION.calendarId);
                        done();
                    });
            });

            it("sends a confirmation", (done) => {
                scheduledAppointmentsController
                    .create(mockRequest, mockResponse, mockNext)
                    .then(() => {
                        expectNoErrorCaught(mockNext);
                        expect(
                            mockHelper.sendAppointmentCreationConfirmation,
                        ).toHaveBeenCalled();
                        done();
                    });
            });

            it("logs the appointment creation event", (done) => {
                scheduledAppointmentsController
                    .create(mockRequest, mockResponse, mockNext)
                    .then(() => {
                        expectNoErrorCaught(mockNext);
                        expect(mockCreateLogger).toHaveBeenCalledWith(
                            mockRequest,
                        );
                        done();
                    });
            });

            it("attempts to set default preferences for the user", (done) => {
                scheduledAppointmentsController
                    .create(mockRequest, mockResponse, mockNext)
                    .then(() => {
                        expectNoErrorCaught(mockNext);
                        expect(
                            mockRequest.user
                                .setDefaultAppointmentPreferencesIfNoneSet,
                        ).toHaveBeenCalled();
                        done();
                    });
            });

            it("responds with a success message", (done) => {
                scheduledAppointmentsController
                    .create(mockRequest, mockResponse, mockNext)
                    .then(() => {
                        expectNoErrorCaught(mockNext);
                        expect(mockResponse.status).toHaveBeenCalledWith(200);
                        expect(mockResponse.json).toHaveBeenCalledWith({
                            message: "OK",
                        });
                        done();
                    });
            });
        });

        it("does not schedule an appointment and delegates the reason upstream if scheduling is not possible", (done) => {
            const rejectionReason = "no u";
            mockHelper.canCreateAppointment.mockReturnValue({
                canCreateAppointment: false,
                reason: rejectionReason,
            });

            scheduledAppointmentsController
                .create(mockRequest, mockResponse, mockNext)
                .then(() => {
                    expect(mockNext).toHaveBeenCalledWith(
                        expect.objectContaining({
                            error: expect.stringContaining(rejectionReason),
                            status: 422,
                        }),
                    );
                    done();
                });
        });
    });
});
