import { Component, OnInit, Input, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { Params } from '@angular/router';
import { DatePipe } from '@angular/common';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Subscription } from 'rxjs';
import { NoteModalComponent } from '../note-modal/note-modal.component';
import { NoteService } from '../../../../shared/service/note.service';
import { RouterParamsService } from '../../../../shared/service/router-params.service';
import { ModalParam } from '../../../../shared/models/modal-param';
import { Note } from '../../../../shared/models/note';
import { Security } from '../../../../shared/enum/security';

@Component({
    selector: 'app-note-dashboard',
    templateUrl: './note-dashboard.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    styleUrls: ['./note-dashboard.component.css']
})

export class NoteDashboardComponent implements OnInit {
    private _subscription:Subscription = new Subscription();
    private _tribeId: number;
    
    public params: Params;
    public model: Note[];

    constructor(private _modalService: NgbModal, 
        private _noteService: NoteService,
        private _routerParamsService: RouterParamsService,
        private _cdr: ChangeDetectorRef,
        public datePipe: DatePipe) { }

    ngOnInit() {
        this.params = {};
        // The RouteParams service aggregates the params across all segments. When the
        // router state changes, the "params" stream is updated with the new values.
        this._subscription.add(this._routerParamsService.params.subscribe(( params: Params ) : void => {
            this.params = params;
            this._tribeId = +params['id'];

            this.fetchNotes(this._tribeId);
        })); 

        this._subscription.add(this._noteService.noteEvent
            .subscribe(message => this.handleNoteEvent(message))
        );
    }

    private handleNoteEvent(message:any){
        console.log('Note Dashboard - handleNoteEvent', message);
        if(message['event'] && message['event'] === 'AddNote'){
            this.model.push(message['data']);
            this._cdr.markForCheck();
        }else if(message['event'] && message['event'] === 'UpdateNote'){

            let updatedNote = <Note>message['data'];

            let item = this.model.find(rec => rec.noteId == updatedNote.noteId);

            if(item){
                let elementIndex = this.model.indexOf(item);
                if(elementIndex != -1){
                    this.model[elementIndex] = updatedNote;
                    this._cdr.markForCheck();
                }
            }
        }
    }

    private fetchNotes(spaceId:number){
        this._subscription.add(this._noteService.GetBySpaceId(spaceId)
        .subscribe(
            data => {
                console.log('fetchNotes ', data);
                this.model = data;
                this._cdr.markForCheck();
            },
            error => { console.log('fetchNotes error', error)}
        ));
    }

    public addNote() {
        this._subscription.add(this._noteService.Add('Note on '+ this.datePipe.transform(Date.now(), 'yyyy-MM-dd'), 
            this._tribeId, Security.MeOnly)
        .subscribe(
            data => { 
                console.log('addNote', data);
                this.openNote(data.noteId);
            },
            error => { console.log('addNote', error)}
        ))
    }

    public openNote(noteId) {
        console.log('Note Dashboard - Open NoteId', noteId);
        const modalRef = this._modalService.open(NoteModalComponent);
        modalRef.componentInstance.param = new ModalParam({'key':'noteId', 'value': noteId});
    }  

    ngOnDestroy(){
        if(this._subscription){
            this._subscription.unsubscribe();
        }
    }  

}
