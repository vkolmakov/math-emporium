import ScheduledAppointmentsController from '../../../server/scheduledAppointments/scheduledAppointments.controller.js';

describe('ScheduledAppointmentsController', () => {
    const LOCATIONS = [1];

    let scheduledAppointmentsController;

    let mockMainStorage;
    let mockHelper;

    let mockRequest;
    let mockResponse;
    let mockNext;

    beforeEach(() => {
        mockMainStorage = {
            db: {
                models: {
                    location: {
                        findAll: jest.fn()
                            .mockReturnValue(Promise.resolve(LOCATIONS)),
                    },

                    scheduledAppointment: {
                        findAll: jest.fn()
                            .mockReturnValue(Promise.resolve([])),
                    },
                },
            },
        };

        mockHelper = {
            getExistingActiveAppointments: jest.fn(),
            canCreateAppointment: jest.fn(),
            createAppointment: jest.fn(),
        };

        mockRequest = {
            user: {
                id: 1,
            },
            body: {},
        };

        mockResponse = {
            status: jest.fn()
                .mockReturnThis(),
            json: jest.fn()
                .mockReturnThis(),
        };

        mockNext = jest.fn();

        scheduledAppointmentsController = new ScheduledAppointmentsController(mockMainStorage, mockHelper);
    });

    describe('create', () => {
        it('determines whether the appointment can be scheduled by using existing active appointments that user owns', (done) => {
            const existingActiveAppointments = [1, 2, 3];
            mockHelper.getExistingActiveAppointments.mockReturnValue(existingActiveAppointments);

            const postHandler = scheduledAppointmentsController.create();
            postHandler(mockRequest, mockResponse, mockNext).then(() => {
                expect(mockHelper.canCreateAppointment).toHaveBeenCalledWith(existingActiveAppointments, LOCATIONS);
                done();
            });
        });

        it('creates an appointment if user is eligible to create one and responds with OK message', (done) => {
            mockHelper.canCreateAppointment.mockReturnValue({
                canCreateAppointment: true,
                reason: '',
            });

            const postHandler = scheduledAppointmentsController.create();
            postHandler(mockRequest, mockResponse, mockNext).then(() => {
                expect(mockHelper.createAppointment).toHaveBeenCalledWith(mockRequest.user, mockRequest.body);
                expect(mockResponse.status).toHaveBeenCalledWith(200);
                expect(mockResponse.json).toHaveBeenCalledWith({ message: 'OK' });
                done();
            });
        });

        it('does not create an appointment and delegates the error upsteam with the reason', () => {

        });
    });
});
