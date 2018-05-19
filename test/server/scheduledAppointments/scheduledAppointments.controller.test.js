import ScheduledAppointmentsController from '../../../server/scheduledAppointments/scheduledAppointments.controller.js';

describe('ScheduledAppointmentsController', () => {
    const LOCATION = {
        calendarId: 'fluffy-doggy-2'
    };

    let scheduledAppointmentsController;

    let mockCacheService;
    let mockDateTime;
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

        mockHelper = {
            canCreateAppointment: jest.fn(),
            createAppointment: jest.fn(),
            sendAppointmentCreationConfirmation: jest.fn(),
            gatherCompleteAppointmentData: jest.fn()
                .mockReturnValue(Promise.resolve({ location: LOCATION })),
            getActiveAppointmentsForUserAtLocation: jest.fn(),
        };

        mockRequest = {
            user: { id: 1 },
            body: {},
        };

        mockResponse = {
            status: jest.fn()
                .mockReturnThis(),
            json: jest.fn()
                .mockReturnThis(),
        };

        mockNext = jest.fn();

        scheduledAppointmentsController = new ScheduledAppointmentsController(
            mockCacheService,
            mockDateTime,
            mockHelper);
    });

    const expectNoErrorCaught = (nextFunction) => expect(nextFunction).not.toHaveBeenCalled();

    describe('create', () => {
        describe('if scheduling appointment is possible', () => {
            beforeEach(() => {
                mockHelper.canCreateAppointment.mockReturnValue({
                    canCreateAppointment: true,
                    reason: '',
                });
                mockHelper.createAppointment.mockReturnValue(Promise.resolve());
            });

            it('schedules an appointment', (done) => {
                scheduledAppointmentsController.create(mockRequest, mockResponse, mockNext).then(() => {
                    expectNoErrorCaught(mockNext);
                    expect(mockHelper.canCreateAppointment).toHaveBeenCalled();
                    done();
                });
            });

            it('invalidates calendar cache', (done) => {
                scheduledAppointmentsController.create(mockRequest, mockResponse, mockNext).then(() => {
                    expectNoErrorCaught(mockNext);
                    expect(mockCacheService.calendarEvents.invalidate).toHaveBeenCalledWith(LOCATION.calendarId);
                    done();
                });
            });

            it('sends a confirmation', (done) => {
                scheduledAppointmentsController.create(mockRequest, mockResponse, mockNext).then(() => {
                    expectNoErrorCaught(mockNext);
                    expect(mockHelper.sendAppointmentCreationConfirmation).toHaveBeenCalled();
                    done();
                });
            });

            it('responds with a success message', (done) => {
                scheduledAppointmentsController.create(mockRequest, mockResponse, mockNext).then(() => {
                    expectNoErrorCaught(mockNext);
                    expect(mockResponse.status).toHaveBeenCalledWith(200);
                    expect(mockResponse.json).toHaveBeenCalledWith({ message: 'OK' });
                    done();
                });
            });

        });

        it('does not schedule an appointment and delegates the reason upstream if scheduling is not possible', (done) => {
            const rejectionReason = 'no u';
            mockHelper.canCreateAppointment.mockReturnValue({
                canCreateAppointment: false,
                reason: rejectionReason,
            });

            scheduledAppointmentsController.create(mockRequest, mockResponse, mockNext).then(() => {
                expect(mockNext).toHaveBeenCalledWith(expect.objectContaining({
                    error: expect.stringContaining(rejectionReason),
                    status: 422
                }));
                done();
            });
        });
    });
});
