import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { PayrollService, PayrollResponse } from '../../services/payroll.service';
import { LayoutComponent } from '../../components/layout/layout.component';

@Component({
  selector: 'app-payslip',
  standalone: true,
  imports: [CommonModule, RouterLink, LayoutComponent],
  template: `
    <app-layout pageTitle="Payslip Details" pageSubtitle="Salary breakdown and deductions">
      <div header-actions>
        <a routerLink="/payroll" class="btn btn-outline-secondary me-2">
          <span>←</span> Back
        </a>
        <button class="btn btn-primary" (click)="printPayslip()">
          <span>🖨️</span> Print Payslip
        </button>
      </div>

      <div class="row justify-content-center" *ngIf="payroll">
        <div class="col-lg-10">
          <!-- Printable Area -->
          <div id="printable-payslip" class="custom-card p-0 overflow-hidden bg-white">
            <!-- Header -->
            <div class="p-5 border-bottom bg-light d-flex justify-content-between align-items-center">
              <div>
                <h3 class="fw-bold text-primary mb-1">WorkForce Hub Inc.</h3>
                <p class="text-muted mb-0">123 Tech Park, Bangalore 560001</p>
              </div>
              <div class="text-end">
                <h4 class="text-dark mb-1">PAYSLIP</h4>
                <p class="text-muted mb-0">{{ getMonthName(payroll.month) }} {{ payroll.year }}</p>
              </div>
            </div>

            <div class="p-5">
              <!-- Employee Info -->
              <div class="row mb-5">
                <div class="col-sm-6">
                  <h6 class="text-muted small text-uppercase mb-3">Employee Details</h6>
                  <table class="table table-borderless table-sm">
                    <tbody>
                      <tr>
                        <td class="text-muted ps-0" width="120">Employee Name:</td>
                        <td class="fw-medium">{{ payroll.employeeName }}</td>
                      </tr>
                      <tr>
                        <td class="text-muted ps-0">Employee ID:</td>
                        <td class="fw-medium">EMP-{{ payroll.employeeId }}</td>
                      </tr>
                      <tr>
                        <td class="text-muted ps-0">Department:</td>
                        <td class="fw-medium">{{ payroll.department }}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <div class="col-sm-6 text-end">
                  <h6 class="text-muted small text-uppercase mb-3">Payment Details</h6>
                  <table class="table table-borderless table-sm">
                    <tbody>
                      <tr>
                        <td class="text-muted pe-0">Payslip ID:</td>
                        <td class="fw-medium text-end">PAY-{{ payroll.id }}</td>
                      </tr>
                      <tr>
                        <td class="text-muted pe-0">Status:</td>
                        <td class="fw-medium text-end">
                          <span class="badge" [class.bg-success]="payroll.status === 'PAID'" 
                                [class.bg-secondary]="payroll.status !== 'PAID'">
                            {{ payroll.status }}
                          </span>
                        </td>
                      </tr>
                      <tr *ngIf="payroll.paidDate">
                        <td class="text-muted pe-0">Paid Date:</td>
                        <td class="fw-medium text-end">{{ payroll.paidDate | date:'mediumDate' }}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <!-- Salary Breakdown -->
              <div class="row">
                <!-- Earnings -->
                <div class="col-md-6 mb-4 mb-md-0">
                  <div class="card h-100 border rounded shadow-sm">
                    <div class="card-header bg-light py-3 border-bottom text-primary fw-bold">
                      EARNINGS
                    </div>
                    <div class="card-body p-0">
                      <table class="table table-borderless mb-0">
                        <tbody>
                          <tr class="border-bottom">
                            <td class="py-3 px-4">Basic Salary</td>
                            <td class="py-3 px-4 text-end">{{ payroll.baseSalary | currency:'INR' }}</td>
                          </tr>
                          <tr class="border-bottom">
                            <td class="py-3 px-4">House Rent Allowance (HRA)</td>
                            <td class="py-3 px-4 text-end">{{ payroll.hra | currency:'INR' }}</td>
                          </tr>
                          <tr class="border-bottom">
                            <td class="py-3 px-4">Conveyance Allowance</td>
                            <td class="py-3 px-4 text-end">{{ payroll.conveyanceAllowance | currency:'INR' }}</td>
                          </tr>
                          <tr class="border-bottom">
                            <td class="py-3 px-4">Medical Allowance</td>
                            <td class="py-3 px-4 text-end">{{ payroll.medicalAllowance | currency:'INR' }}</td>
                          </tr>
                          <tr>
                            <td class="py-3 px-4">Special Allowance</td>
                            <td class="py-3 px-4 text-end">{{ payroll.specialAllowance | currency:'INR' }}</td>
                          </tr>
                          <tr *ngIf="payroll.bonus > 0">
                            <td class="py-3 px-4 text-success">Bonus</td>
                            <td class="py-3 px-4 text-end text-success">+{{ payroll.bonus | currency:'INR' }}</td>
                          </tr>
                        </tbody>
                        <tfoot class="bg-light border-top">
                          <tr>
                            <th class="py-3 px-4">Gross Earnings</th>
                            <th class="py-3 px-4 text-end fs-5">{{ (payroll.grossSalary + payroll.bonus) | currency:'INR' }}</th>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </div>
                </div>

                <!-- Deductions -->
                <div class="col-md-6">
                  <div class="card h-100 border rounded shadow-sm">
                    <div class="card-header bg-light py-3 border-bottom text-danger fw-bold">
                      DEDUCTIONS
                    </div>
                    <div class="card-body p-0">
                      <table class="table table-borderless mb-0">
                        <tbody>
                          <tr class="border-bottom">
                            <td class="py-3 px-4">Provident Fund (PF)</td>
                            <td class="py-3 px-4 text-end">{{ payroll.pfDeduction | currency:'INR' }}</td>
                          </tr>
                          <tr class="border-bottom">
                            <td class="py-3 px-4">Income Tax (TDS)</td>
                            <td class="py-3 px-4 text-end">{{ payroll.taxDeduction | currency:'INR' }}</td>
                          </tr>
                          <tr>
                            <td class="py-3 px-4">Other Deductions</td>
                            <td class="py-3 px-4 text-end">{{ payroll.otherDeductions | currency:'INR' }}</td>
                          </tr>
                        </tbody>
                        <tfoot class="bg-light border-top" style="margin-top: auto;">
                          <tr>
                            <th class="py-3 px-4">Total Deductions</th>
                            <th class="py-3 px-4 text-end fs-5 text-danger">-{{ payroll.totalDeductions | currency:'INR' }}</th>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Net Pay Summary -->
              <div class="mt-5 bg-primary text-white rounded p-4 d-flex justify-content-between align-items-center shadow">
                <div>
                  <h5 class="mb-1 text-white opacity-75">Net Payable Salary</h5>
                  <p class="mb-0 small opacity-75">Amount transferred to salary account</p>
                </div>
                <div class="text-end">
                  <h2 class="mb-0 fw-bold">{{ payroll.netSalary | currency:'INR' }}</h2>
                </div>
              </div>
              
              <div class="mt-5 text-center text-muted small">
                <p>This is a computer-generated document. No signature is required.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </app-layout>
  `
})
export class PayslipComponent implements OnInit {
  payroll: PayrollResponse | null = null;
  months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  constructor(
    private payrollService: PayrollService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    const id = +this.route.snapshot.paramMap.get('id')!;
    this.payrollService.getPayrollById(id).subscribe(res => {
      this.payroll = res;
    });
  }

  getMonthName(monthNum: number): string {
    return this.months[monthNum - 1];
  }

  printPayslip(): void {
    const printContent = document.getElementById('printable-payslip');
    const windowPrint = window.open('', '', 'left=0,top=0,width=800,height=900,toolbar=0,scrollbars=0,status=0');
    
    if (windowPrint && printContent) {
      windowPrint.document.write(`
        <html>
          <head>
            <title>Payslip - ${this.payroll?.employeeName}</title>
            <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
            <style>
              body { font-family: 'Inter', sans-serif; background: #fff; padding: 20px; }
              .card { border: 1px solid #dee2e6 !important; }
              @media print {
                body { padding: 0; }
                .shadow-sm, .shadow { box-shadow: none !important; }
              }
            </style>
          </head>
          <body>
            ${printContent.innerHTML}
          </body>
        </html>
      `);
      
      windowPrint.document.close();
      windowPrint.focus();
      
      setTimeout(() => {
        windowPrint.print();
        windowPrint.close();
      }, 500);
    }
  }
}
